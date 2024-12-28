address 0xcb2544fc45f3bbef5f30f2c07fda006ab5486f050bd19f6e542ffb49240b8ff6 {
    module NFTMarketplace {
        use 0x1::signer;
        use 0x1::vector;
        use 0x1::coin;
        use 0x1::aptos_coin::AptosCoin;

        // NFT Structure
        struct NFT has store, key {
            id: u64,
            owner: address,
            minter: address,
            name: vector<u8>,
            description: vector<u8>,
            uri: vector<u8>,
            price: u64,
            for_sale: bool,
            rarity: u8
        }

        // Add a struct to track NFT sales
        struct NFTSale has store {
            nft_id: u64,
            seller: address,
            buyer: address,
            price: u64,
        }

        // Store NFTs in a central collection
        struct NFTStore has key {
            all_nfts: vector<NFT>,
            next_nft_id: u64,
            sales_history: vector<NFTSale>
        }

        // Initialize NFTStore if it doesn't exist
        fun init_module(account: &signer) {
            move_to(account, NFTStore {
                all_nfts: vector::empty<NFT>(),
                next_nft_id: 0,
                sales_history: vector::empty<NFTSale>()
            });
        }

        // Mint new NFT
        public entry fun mint_nft(
            account: &signer,
            name: vector<u8>,
            description: vector<u8>,
            uri: vector<u8>,
            rarity: u8
        ) acquires NFTStore {
            let store = borrow_global_mut<NFTStore>(@0xcb2544fc45f3bbef5f30f2c07fda006ab5486f050bd19f6e542ffb49240b8ff6);
            let nft = NFT {
                id: store.next_nft_id,
                owner: signer::address_of(account),
                minter: signer::address_of(account),
                name,
                description,
                uri,
                price: 0,
                for_sale: false,
                rarity
            };
            
            vector::push_back(&mut store.all_nfts, nft);
            store.next_nft_id = store.next_nft_id + 1;
        }

        // List NFT for sale
        public entry fun list_for_sale(
            account: &signer,
            nft_id: u64,
            price: u64
        ) acquires NFTStore {
            let account_addr = signer::address_of(account);
            let store = borrow_global_mut<NFTStore>(@0xcb2544fc45f3bbef5f30f2c07fda006ab5486f050bd19f6e542ffb49240b8ff6);
            let i = 0;
            let len = vector::length(&store.all_nfts);
            
            while (i < len) {
                let nft = vector::borrow_mut(&mut store.all_nfts, i);
                if (nft.id == nft_id && nft.owner == account_addr) {
                    nft.price = price;
                    nft.for_sale = true;
                    break
                };
                i = i + 1;
            };
        }

        // Purchase NFT
        public entry fun purchase_nft(
            buyer: &signer,
            seller_addr: address,
            nft_id: u64
        ) acquires NFTStore {
            let store = borrow_global_mut<NFTStore>(@0xcb2544fc45f3bbef5f30f2c07fda006ab5486f050bd19f6e542ffb49240b8ff6);
            let buyer_addr = signer::address_of(buyer);
            let i = 0;
            let len = vector::length(&store.all_nfts);
            
            while (i < len) {
                let nft = vector::borrow_mut(&mut store.all_nfts, i);
                if (nft.id == nft_id && nft.for_sale && nft.owner == seller_addr) {
                    let price = nft.price;
                    
                    // Record the sale before updating the NFT
                    let sale = NFTSale {
                        nft_id: nft_id,
                        seller: seller_addr,
                        buyer: buyer_addr,
                        price: price
                    };
                    vector::push_back(&mut store.sales_history, sale);
                    
                    // Process the sale
                    coin::transfer<AptosCoin>(buyer, seller_addr, price);
                    nft.owner = buyer_addr;
                    nft.for_sale = false;
                    nft.price = 0;
                    break
                };
                i = i + 1;
            };
        }

        // Get user's minted NFTs (only show NFTs that are minted by user, not listed, and not sold)
        #[view]
        public fun get_user_nfts(user_addr: address): vector<NFTInfo> acquires NFTStore {
            let store = borrow_global<NFTStore>(@0xcb2544fc45f3bbef5f30f2c07fda006ab5486f050bd19f6e542ffb49240b8ff6);
            let user_nfts = vector::empty<NFTInfo>();
            let i = 0;
            let nfts_len = vector::length(&store.all_nfts);
            
            while (i < nfts_len) {
                let nft = vector::borrow(&store.all_nfts, i);
                // Only include NFTs where:
                // 1. User is the minter
                // 2. User is still the owner (not sold)
                // 3. NFT is not listed for sale
                if (nft.minter == user_addr && nft.owner == user_addr && !nft.for_sale) {
                    let nft_info = NFTInfo {
                        id: nft.id,
                        owner: nft.owner,
                        minter: nft.minter,
                        name: nft.name,
                        description: nft.description,
                        uri: nft.uri,
                        price: nft.price,
                        for_sale: nft.for_sale,
                        rarity: nft.rarity
                    };
                    vector::push_back(&mut user_nfts, nft_info);
                };
                i = i + 1;
            };

            user_nfts
        }

        // Get all NFTs for sale
        #[view]
        public fun get_all_nfts_for_sale(): vector<NFTInfo> acquires NFTStore {
            let store = borrow_global<NFTStore>(@0xcb2544fc45f3bbef5f30f2c07fda006ab5486f050bd19f6e542ffb49240b8ff6);
            let sale_nfts = vector::empty<NFTInfo>();
            let i = 0;
            let nfts_len = vector::length(&store.all_nfts);
            
            while (i < nfts_len) {
                let nft = vector::borrow(&store.all_nfts, i);
                if (nft.for_sale) {
                    let nft_info = NFTInfo {
                        id: nft.id,
                        owner: nft.owner,
                        minter: nft.minter,
                        name: nft.name,
                        description: nft.description,
                        uri: nft.uri,
                        price: nft.price,
                        for_sale: nft.for_sale,
                        rarity: nft.rarity
                    };
                    vector::push_back(&mut sale_nfts, nft_info);
                };
                i = i + 1;
            };

            sale_nfts
        }

        // Add this function to get purchased NFTs
        #[view]
        public fun get_purchased_nfts(user_addr: address): vector<NFTInfo> acquires NFTStore {
            let store = borrow_global<NFTStore>(@0xcb2544fc45f3bbef5f30f2c07fda006ab5486f050bd19f6e542ffb49240b8ff6);
            let purchased_nfts = vector::empty<NFTInfo>();
            let i = 0;
            let nfts_len = vector::length(&store.all_nfts);
            
            while (i < nfts_len) {
                let nft = vector::borrow(&store.all_nfts, i);
                // Include NFTs where user is owner but not minter (purchased NFTs)
                if (nft.owner == user_addr && nft.minter != user_addr) {
                    let nft_info = NFTInfo {
                        id: nft.id,
                        owner: nft.owner,
                        minter: nft.minter,
                        name: nft.name,
                        description: nft.description,
                        uri: nft.uri,
                        price: nft.price,
                        for_sale: nft.for_sale,
                        rarity: nft.rarity
                    };
                    vector::push_back(&mut purchased_nfts, nft_info);
                };
                i = i + 1;
            };

            purchased_nfts
        }

        // Add this function for donations
        public entry fun donate_to_creator(
            donor: &signer,
            creator_addr: address,
            amount: u64
        ) {
            // Transfer APT from donor to creator
            coin::transfer<AptosCoin>(donor, creator_addr, amount);
        }

        // Add this function to get creator stats
        #[view]
        public fun get_creator_stats(creator_addr: address): CreatorStats acquires NFTStore {
            let store = borrow_global<NFTStore>(@0xcb2544fc45f3bbef5f30f2c07fda006ab5486f050bd19f6e542ffb49240b8ff6);
            let total_nfts = 0;
            let listed_nfts = 0;
            let i = 0;
            let nfts_len = vector::length(&store.all_nfts);
            
            while (i < nfts_len) {
                let nft = vector::borrow(&store.all_nfts, i);
                if (nft.minter == creator_addr) {
                    total_nfts = total_nfts + 1;
                    if (nft.for_sale) {
                        listed_nfts = listed_nfts + 1;
                    };
                };
                i = i + 1;
            };

            CreatorStats {
                address: creator_addr,
                total_nfts,
                listed_nfts
            }
        }

        // Add this function to get all creators and their stats
        #[view]
        public fun get_all_creators(): vector<CreatorStats> acquires NFTStore {
            let store = borrow_global<NFTStore>(@0xcb2544fc45f3bbef5f30f2c07fda006ab5486f050bd19f6e542ffb49240b8ff6);
            let creators = vector::empty<address>();
            let creator_stats = vector::empty<CreatorStats>();
            let i = 0;
            let nfts_len = vector::length(&store.all_nfts);
            
            // First, get unique creators
            while (i < nfts_len) {
                let nft = vector::borrow(&store.all_nfts, i);
                if (!vector::contains(&creators, &nft.minter)) {
                    vector::push_back(&mut creators, nft.minter);
                };
                i = i + 1;
            };

            // Then get stats for each creator
            let j = 0;
            let creators_len = vector::length(&creators);
            while (j < creators_len) {
                let creator_addr = *vector::borrow(&creators, j);
                let total_nfts = 0;
                let listed_nfts = 0;
                let k = 0;
                
                while (k < nfts_len) {
                    let nft = vector::borrow(&store.all_nfts, k);
                    if (nft.minter == creator_addr) {
                        total_nfts = total_nfts + 1;
                        if (nft.for_sale) {
                            listed_nfts = listed_nfts + 1;
                        };
                    };
                    k = k + 1;
                };

                let stats = CreatorStats {
                    address: creator_addr,
                    total_nfts,
                    listed_nfts
                };
                vector::push_back(&mut creator_stats, stats);
                j = j + 1;
            };

            creator_stats
        }

        // Add this struct for creator stats
        struct CreatorStats has copy, drop {
            address: address,
            total_nfts: u64,
            listed_nfts: u64
        }

        struct NFTInfo has copy, drop {
            id: u64,
            owner: address,
            minter: address,
            name: vector<u8>,
            description: vector<u8>,
            uri: vector<u8>,
            price: u64,
            for_sale: bool,
            rarity: u8
        }

        // Add these functions to get marketplace stats
        #[view]
        public fun get_marketplace_stats(): MarketplaceStats acquires NFTStore {
            let store = borrow_global<NFTStore>(@0xcb2544fc45f3bbef5f30f2c07fda006ab5486f050bd19f6e542ffb49240b8ff6);
            let total_nfts = vector::length(&store.all_nfts);
            let total_listed = 0;
            let total_sold = vector::length(&store.sales_history);
            let total_volume = 0;
            let unique_creators = vector::empty<address>();
            let i = 0;
            
            // Count listed NFTs and unique creators
            while (i < total_nfts) {
                let nft = vector::borrow(&store.all_nfts, i);
                if (nft.for_sale) {
                    total_listed = total_listed + 1;
                };
                if (!vector::contains(&unique_creators, &nft.minter)) {
                    vector::push_back(&mut unique_creators, nft.minter);
                };
                i = i + 1;
            };

            // Calculate total volume from sales history
            let j = 0;
            let sales_len = vector::length(&store.sales_history);
            while (j < sales_len) {
                let sale = vector::borrow(&store.sales_history, j);
                total_volume = total_volume + sale.price;
                j = j + 1;
            };

            MarketplaceStats {
                total_nfts,
                total_listed,
                total_sold,
                total_volume,
                total_creators: vector::length(&unique_creators)
            }
        }

        // Add this struct for marketplace stats
        struct MarketplaceStats has copy, drop {
            total_nfts: u64,
            total_listed: u64,
            total_sold: u64,
            total_volume: u64,
            total_creators: u64
        }

        // Add transfer function
        public entry fun transfer_nft(
            from: &signer,
            to: address,
            nft_id: u64
        ) acquires NFTStore {
            let store = borrow_global_mut<NFTStore>(@0xcb2544fc45f3bbef5f30f2c07fda006ab5486f050bd19f6e542ffb49240b8ff6);
            let sender_addr = signer::address_of(from);
            
            let i = 0;
            let len = vector::length(&store.all_nfts);
            
            while (i < len) {
                let nft = vector::borrow_mut(&mut store.all_nfts, i);
                if (nft.id == nft_id && nft.owner == sender_addr) {
                    assert!(!nft.for_sale, 1000); // Cannot transfer NFT that is listed for sale
                    nft.owner = to;
                    break
                };
                i = i + 1;
            };
        }

        // Add function to get received NFTs
        #[view]
        public fun get_received_nfts(owner_addr: address): vector<NFTInfo> acquires NFTStore {
            let store = borrow_global<NFTStore>(@0xcb2544fc45f3bbef5f30f2c07fda006ab5486f050bd19f6e542ffb49240b8ff6);
            let received_nfts = vector::empty<NFTInfo>();
            let i = 0;
            let nfts_len = vector::length(&store.all_nfts);
            
            while (i < nfts_len) {
                let nft = vector::borrow(&store.all_nfts, i);
                // Include NFTs where user is owner but not minter and not purchased (transferred)
                if (nft.owner == owner_addr && nft.minter != owner_addr) {
                    let nft_info = NFTInfo {
                        id: nft.id,
                        owner: nft.owner,
                        minter: nft.minter,
                        name: nft.name,
                        description: nft.description,
                        uri: nft.uri,
                        price: nft.price,
                        for_sale: nft.for_sale,
                        rarity: nft.rarity
                    };
                    vector::push_back(&mut received_nfts, nft_info);
                };
                i = i + 1;
            };

            received_nfts
        }
    }
}