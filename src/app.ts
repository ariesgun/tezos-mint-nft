// src/app.ts
import { TezosToolkit } from '@taquito/taquito';
import { InMemorySigner } from '@taquito/signer';
import * as faucet from '../faucet.json';

export class App {

	private tezos: TezosToolkit;

	constructor(rpcUrl: string) {
		this.tezos = new TezosToolkit(rpcUrl);
		this.tezos.setSignerProvider(InMemorySigner.fromFundraiser(faucet.email, faucet.password, faucet.mnemonic.join(' ')));
	}

    public async activateAccount() {
        const {pkh, activation_code} = faucet;

        try {
            const operation = await this.tezos.tz.activate(pkh, activation_code);
            await operation.confirmation();
        } catch (e) {
            console.log(e)
        }
    }

    public async main() { }
}
