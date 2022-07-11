import { gql } from "graphql-request";

export const positionsQuery = gql`
    query getPositions($first: Int, $lastId: String = "0") {
        positions( first: $first, orderBy: id, orderDirection: asc, where: { isActive: false, id_gt: $lastId } ) {
            id
            account {
                id
            }
            isLiquidated
            events {
                id
                market {
                    asset {
                        decimals
                        symbol
                    }
                }
                eventType
                amountUSD
                blockTime
            }
        }
    }
`