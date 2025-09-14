import Link from "next/link";
import Image from "next/image";
import { ConnectedAddress } from "~~/components/ConnectedAddress";
import { Counter } from "~~/components/Counter";

const Home = () => {
  return (
    <div className="flex items-center flex-col grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-2xl mb-2">Welcome to</span>
          <span className="block text-4xl font-bold">Scaffold-Stark 2</span>
        </h1>
        <ConnectedAddress />
        <p className="text-center text-lg">
          Interact with your smart contract{" "}
          <code className="bg-underline italic text-base font-bold max-w-full break-words break-all inline-block">
            CounterContract.cairo
          </code>{" "}
          deployed on{" "}
          <code className="bg-underline italic text-base font-bold max-w-full break-words break-all inline-block">
            Sepolia Testnet
          </code>
        </p>
      </div>

      {/* Counter DApp Section */}
      <div className="w-full mt-16 px-8 py-12">
        <div className="flex justify-center">
          <Counter />
        </div>
      </div>

      <div className="bg-container grow w-full mt-16 px-8 py-12">
        <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
          <div className="flex flex-col bg-base-100 relative text-[12px] px-10 py-10 text-center items-center max-w-xs rounded-3xl border border-gradient">
            <div className="trapeze"></div>
            <Image
              src="/debug-icon.svg"
              alt="icon"
              width={26}
              height={30}
            ></Image>
            <p>
              Tinker with your smart contract using the{" "}
              <Link href="/debug" passHref className="link">
                Debug Contracts
              </Link>{" "}
              tab.
            </p>
          </div>
          <div className="flex flex-col bg-base-100 relative text-[12px] px-10 py-10 text-center items-center max-w-xs rounded-3xl border border-gradient">
            <div className="trapeze"></div>
            <Image
              src="/explorer-icon.svg"
              alt="icon"
              width={20}
              height={32}
            ></Image>
            <p>
              Explore transactions with the{" "}
              <Link href="/blockexplorer" passHref className="link">
                Block Explorer
              </Link>{" "}
              tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
