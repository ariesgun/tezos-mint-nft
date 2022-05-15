// main.ts
import { TezosToolkit, MichelsonMap  } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import { buf2hex } from '@taquito/utils';
import { App } from './src/app';

const RPC_URL = "https://rpc.ithacanet.teztnets.xyz";
const NFT_CONTRACT = "KT1MiVYzmxn6S2tCiSfhnrrantAgjKiSXCw7";

// new App(RPC_URL).activateAccount();

import * as faucet from './faucet.json';
import fa2MultiAssetJson from './contracts/contract.json';

const deploy = async() => {
	try {
		const tezos = new TezosToolkit(RPC_URL);
		tezos.setSignerProvider(InMemorySigner.fromFundraiser(faucet.email, faucet.password, faucet.mnemonic.join(' ')));

        // Initial storage definition
        const admin = {
            admin: faucet.pkh,
            pending_admin: null,
            paused: true
        };           // Admin address.
        const assets = {
            ledger: new MichelsonMap(),
            operators: new MichelsonMap(),
            token_total_supply: new MichelsonMap(),
            token_metadata: new MichelsonMap()
        };

        const metadata = new MichelsonMap();
        metadata.set("", buf2hex(Buffer.from("tezos-storage:content")));
        // metadata.set("content", 0);

        // const closeDate = Date.now() + 10;    
        // const jackpot = 100;
        // const description = "This is an incredible Raffle.";
        // const players = [] as any[];
        // const soldTickets = new MichelsonMap();
        // const raffleIsOpen = true;
        // const winningTicketHash = buf2hex(Buffer.from("ec85151eb06e201cebfbb06d43daa1093cb4731285466eeb8ba1e79e7ee3fae3"));

        const initialStorage = {
            "admin": admin,
            "assets": assets,
            "metadata": metadata,
        }

        const origination = await tezos.contract.originate({
            code: fa2MultiAssetJson,
            storage: initialStorage,
          });
        
          await origination.confirmation();
          const contract = await origination.contract();

          console.log(`Operation Hash: ${origination.hash}`);
          console.log(`Contract Address : ${contract.address}`);

    } catch (err) {
        console.log(err);
    }
}

// Create Tokens
const createNFT = async (token_id: number, ipfs: string) => {
    
    const tezos = new TezosToolkit(RPC_URL);
    tezos.setSignerProvider(InMemorySigner.fromFundraiser(faucet.email, faucet.password, faucet.mnemonic.join(' ')));
    
    tezos.contract
        .at(NFT_CONTRACT)
        .then((contract) => {
            console.log(`Creating NFT ${token_id} ...`);

            const token_info = new MichelsonMap();
            token_info.set("creators", buf2hex(Buffer.from(JSON.stringify(["newbie@tezos.com"]))));
            token_info.set("description", buf2hex(Buffer.from("NFT Collectibles")));
            token_info.set("name", buf2hex(Buffer.from(`NFT ${token_id}`)));
            token_info.set("decimal", buf2hex(Buffer.from("0")));
            token_info.set("isBooleanAmount", buf2hex(Buffer.from("true")));
            token_info.set("minter", buf2hex(Buffer.from("tz1a63xvpqvh9Yn95iNbRcueg4Uoq5Rwgic7")));
            token_info.set("language", buf2hex(Buffer.from("en")));
            token_info.set("artifactUri", buf2hex(Buffer.from(ipfs)));
            token_info.set("displayUri", buf2hex(Buffer.from(ipfs)));

            return contract.methods.create_token(token_id, token_info).send();
            // return contract.methods.increment(increment).send(); // steps 2, 3 and 4
        })
        .then((op) => {
            console.log(`Awaiting for ${op.hash} to be confirmed...`);
            return op.confirmation(3).then(() => op.hash); // step 5
        })
        .then((hash) => console.log(`Operation injected: https://ithacanet.smartpy.io/${hash}`))
        .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
}

const mintToken = async(token_id: number) => {

    const tezos = new TezosToolkit(RPC_URL);
    tezos.setSignerProvider(InMemorySigner.fromFundraiser(faucet.email, faucet.password, faucet.mnemonic.join(' ')));
    
    tezos.contract
        .at(NFT_CONTRACT)
        .then((contract) => {
            console.log(`Minting ${token_id}...`);

            return contract.methods.mint_tokens([{owner: "KT1MiVYzmxn6S2tCiSfhnrrantAgjKiSXCw7", token_id: token_id, amount: 1}]).send();
        })
        .then((op) => {
            console.log(`Awaiting for ${op.hash} to be confirmed...`);
            return op.confirmation(3).then(() => op.hash); // step 5
        })
        .then((hash) => console.log(`Operation injected: https://ithacanet.smartpy.io/${hash}`))
        .catch((error) => console.log(`Error: ${JSON.stringify(error, null, 2)}`));
}

// deploy();
//createNFT(101, "ipfs://bafybeifsegar3kwxts6cpqj5whbyftvqviimexdibbbsnplzm5i2of5l5y");
mintToken(101);

// createNFT(102, "ipfs://bafybeibh4z33ys4kis4mxfk2k5gdl7rowz3yxnnxar5tdzi2gl5xygrf4e");
// mintToken(102);

// createNFT(103, "ipfs://bafybeifcrdepwydlyu4dw6t4l7duj4xoqfhk3kgpz5h3jfjel6eyuqdoeq");
// mintToken(103);

// createNFT(104, "ipfs://bafybeigrc5cgdlwxhjlp56cknywtvbi7dbsconhs2lbudjb5gy3zhs5h5i");
// mintToken(104);

// createNFT(105, "ipfs://bafybeihywn727tdwnldks3y4wjwhdekyt5dhzmqcfkhvuasymlmyjn5yxi");
// mintToken(105);

//createNFT(106, "ipfs://bafybeibititj5fgswcchsv7zdphqp2vezzn5cntf4phfotjolz6z2kyl5y");
// mintToken(106);


