
import { request } from 'graphql-request';
import { AccountReputation, AccountsPositions, Event, Position } from "../common/types";
import { positionsQuery } from './queries';
import { SUBGRAPH_URL, ROWS_TO_PULL } from "../common/constants";
import { BigNumber } from 'ethers';

// NOTICE:
// AAVE-V2 UNI-V2 positions are disregarded due to issues in amountUSD conversion.


export async function getPositionsData(positions: Position[] = []): Promise<any> {
    let lastId = positions.length ? positions[positions.length - 1].id : "";
    try {
        const data : { positions: Position[] } = await request({
            url: SUBGRAPH_URL, 
            document: positionsQuery,
            variables: {
                first: ROWS_TO_PULL,
                lastId: lastId
            }
        });
        positions = [... positions, ...data.positions];
        if (positions.length > 10000) {
            return positions;
        }
        
        console.log(`Pulled ${positions.length} positions.`);
        return await getPositionsData(positions);
    } catch(e) {
        throw e;
    }
}

export function processPositions(positions: Position[]) : AccountsPositions {
    let accounts: AccountsPositions = {};
    positions.forEach((position: Position) : void => {
        accounts[position.account.id] = [...(accounts[position.account.id] ?? []), position]
    });
    return accounts;
}

export function calculateScores(accounts: AccountsPositions) : AccountReputation[] {
    return Object
        .entries(accounts)
        .map((accountEntry: any, index: number) => {
            let accountId: string = accountEntry[0];
            let accountPositions : Position[] = accountEntry[1];
            let totalExp: BigNumber = calculatePositions(accountPositions);
            let accountReputation: AccountReputation = {
                index,
                account: accountId,
                experience: totalExp
            }
            return accountReputation;
        });
}

export function calculatePositions(positions: Position[]) : BigNumber {
    let totalExp: BigNumber = BigNumber.from(0);
    positions.forEach((position: Position) => {
        totalExp = totalExp.add(calculatePositionExp(position));
    })
    return totalExp;
}

export function calculatePositionExp(position: Position) : BigNumber {
    if(position.isLiquidated || position.events.length < 2) return BigNumber.from(0);

    let events: Event[] = position.events;

    if (events.find( e => e.market.asset.symbol == "UNI-V2"))  {
        console.log("found uniswap")
        return BigNumber.from(0);
    }
    events = events.sort((a: Event, b: Event) => a.blockTime - b.blockTime)
    let accumulatives: Event[] = []; 
    let reducers: Event[] = [];
    
    events.forEach((event: Event) => {
        if(["BORROW", "DEPOSIT"].includes(event.eventType)) {
            accumulatives.push(event);
        } else {
            reducers.push(event)
        };
    });

    let expDelta: number = 0;
    for (let i = 0; i < reducers.length; i++) {
        for(let j = 0; j < accumulatives.length; j++) {
            let days = Math.floor(Math.abs((reducers[i].blockTime - accumulatives[j].blockTime)) / 86400);
            let borrowAmount: number = Number(Math.trunc(accumulatives[j].amountUSD).toFixed(3));
            if (borrowAmount  == 0) continue;
            let repayAmount: number = Number(Math.trunc(reducers[i].amountUSD).toFixed(3));
            let diff: number = borrowAmount - repayAmount;
            if (diff > 0) {
                expDelta = calculateExp(expDelta, repayAmount, days);
                accumulatives[j].amountUSD = borrowAmount - repayAmount;
                break;
            } else {
                expDelta = calculateExp(expDelta, borrowAmount, days);
                reducers[i].amountUSD = repayAmount - borrowAmount;
                accumulatives[j].amountUSD = 0;
            }
        };
    };

    return BigNumber.from(Math.round(expDelta));
}

export function calculateExp(current: number, amount: number, days: number): number {
    let multiplier: number = days / 365; 
    let totalDelta = amount * multiplier;
    return current + totalDelta;
}

export async function prepareAccountScores():  Promise<AccountReputation[]> {
    const positionsData: any = await getPositionsData();
    const accountsPositions: AccountsPositions = processPositions(positionsData);
    const accountScores : AccountReputation[] = calculateScores(accountsPositions);
    return accountScores;
};
