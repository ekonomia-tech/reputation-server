
import { BigNumber, Contract, Wallet } from "ethers"

export type Position = {
    id: string
    account: {
        id: string
    }
    events: Event[]
    isLiquidated: boolean
}

export type Event = {
    id: string
    amountUSD: number
    eventType: string
    market: {
        asset: {
            decimals: number
            symbol: string
        }
    }
    blockTime: number
}

export type AccountsPositions = {
    [key: string]: Position[];
}

export type AccountReputation = {
    index: number
    account: string
    experience: BigNumber
}

export type Proof = {
    proof: string[]
    leaf: AccountReputation
}

export type WholeTree = {
    root: string
    wholeTree: string[][]
}

export type ContractData = {
    contract: Contract,
    signer: Wallet
}