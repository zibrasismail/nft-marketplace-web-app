import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WalletConnect = ({ onConnect }: { onConnect: () => void }) => {
  return (
    <Card className="w-[300px] mx-auto mt-10">
      <CardHeader>
        <CardTitle>Connect Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onConnect}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200"
        >
          Connect Pera Wallet
        </Button>
      </CardContent>
    </Card>
  );
};

export default WalletConnect;
