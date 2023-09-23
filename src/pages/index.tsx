import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import { useState } from 'react';
import { IBundler, Bundler } from '@biconomy/bundler'
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from "@biconomy/modules";
import { ethers  } from 'ethers'
import { ChainId } from "@biconomy/core-types"
import { 
  IPaymaster, 
  BiconomyPaymaster,  
} from '@biconomy/paymaster'
import CreateSession from '@/components/CreateSession';




export default function Home() {
  const [address, setAddress] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(null)
  

  const bundler: IBundler = new Bundler({
    //https://dashboard.biconomy.io/
    // for testnets you can reuse this and change the chain id (currently 80001)
    bundlerUrl: "https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",    
    chainId: ChainId.POLYGON_MUMBAI,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  })


  
  const paymaster: IPaymaster = new BiconomyPaymaster({
    //https://dashboard.biconomy.io/
    //replace with your own paymaster url from dashboard (otherwise your transaction may not work :( )
    paymasterUrl: "https://paymaster.biconomy.io/api/v1/80001/ilaD58luy.fca363dc-9667-424d-9ff8-da8ed82d845f"
  })

  const connect = async () => {
    // @ts-ignore
    const { ethereum } = window;
    try {
      setLoading(true)
      const provider = new ethers.providers.Web3Provider(ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const ownerShipModule = await ECDSAOwnershipValidationModule.create({
        signer: signer
      })
      setProvider(provider)

      let biconomySmartAccount = await BiconomySmartAccountV2.create({
        chainId: ChainId.POLYGON_MUMBAI,
        bundler: bundler,
        paymaster: paymaster,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        defaultValidationModule: ownerShipModule,
        activeValidationModule: ownerShipModule,
      })
      const address = await biconomySmartAccount.getAccountAddress()
      setSmartAccount(biconomySmartAccount)
      console.log({ address })
      setAddress(address)
      console.log({ biconomySmartAccount })
      setLoading(false)
    } catch (error) {
      console.error(error);
    }
  };
  console.log({ smartAccount , provider })
  return (
    <>
      <Head>
        <title>Session Keys</title>
        <meta name="description" content="Build a dApp powered by session keys" />
      </Head>
      <main className={styles.main}>
        <h1>Session Keys Demo</h1>
        <h2>Connect and transfer ERC20 tokens without signing on each transfer</h2>
        {!loading && !address && <button onClick={connect} className={styles.connect}>Connect to Web3</button>}
        {loading && <p>Loading Smart Account...</p>}
        {address && <h2>Smart Account: {address}</h2>}
        {smartAccount && provider && <CreateSession smartAccount={smartAccount} address={address} provider={provider} />}
      </main>
    </>
  )
}
