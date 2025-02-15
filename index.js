const { buyStorage } = require('./chain/buy-storage')
const { deployToken } = require('./token/deploy-token')
const { createToken } = require('./token/create-token')
const { issueToken } = require('./token/issue-token')
const { transferToken } = require('./token/transfer-token')
const { createCollection } = require('./nft/create-collection')
const { createSchema } = require('./nft/create-schema')
const { createTemplate } = require('./nft/create-template')
const { getTemplates } = require('./nft/get-templates')
const { getNfts } = require('./nft/get-nfts')
const { getListings } = require('./nft/get-listings')
const { createNft } = require('./nft/create-nft')
const { sellNft } = require('./nft/marketplace-sell')
const { buyNft } = require('./nft/marketplace-buy')
const { cancelNftSale } = require('./nft/marketplace-unlist')
const { transferNft } = require('./nft/transfer-nft')
const { ACCOUNT } = require('./constants')

const main = async () => {
    /**
     * CHAIN
     */
    // Buy Blockchain Storage
    // Costs 22 XPR / KB (~6,600 XPR for 300KB)
    await buyStorage({
        bytes: 300000
    })

    /**
     * TOKEN
     */
    // Deploy Token
    await deployToken()

    // Create token
    // Note that the .0000 means precision is 4 for this token
    await createToken({
        maximumSupply: '10000.0000 RANDOM'
    })

    // Issue token
    await issueToken({
        quantity: '10000.0000 RANDOM'
    })

    // Transfer token
    await transferToken({
        to: 'syed',
        quantity: '1.0000 RANDOM',
        memo: ''
    })

    /**
     * NFT Creation
     */
    const COLLECTION_NAME = 'testdeploy'
    // 1% from every sale
    const CREATOR_FEE = 0.01
    const SCHEMA_NAME = 'test'
    // uint16 has max value of 65535, use uint32 or uin64 for higher ranges 
    const SCHEMA = {
        image: 'image',
        series: 'uint16',
        name: 'string',
        health: 'uint16',
    }
    // can only mint this many NFTs in the template (edition size)
    const MAX_SUPPLY_TEMPLATE = 100
    // This is template-level data that can NOT be modified
    // Use https://pinata.cloud/ to upload image and get IPFS hash
    const TEMPLATE_DATA = [
        { key: 'image', value: ['string', 'QmPfkthP29F3a4RauRSZnGuMy4QV7bKfS4fvdkUTvGL7Hi'] },
        { key: 'series', value: ['uint16', 1] },
        { key: 'name', value: ['string', 'RandomNFT'] },
    ]
    // This is NFT-level specific data that can NOT be modified
    const NFT_IMMUTABLE_DATA = []
    // This is NFT-level specific data that can be modified
    const NFT_MUTABLE_DATA = [
        { key: 'health', value: ['uint16', 1] },
    ]

    // Create collection
    await createCollection({
        collection_name: COLLECTION_NAME,
        creator_fee: CREATOR_FEE
    })

    // Create schema
    await createSchema({
        collection_name: COLLECTION_NAME,
        schema_name: SCHEMA_NAME,
        schema: SCHEMA
    })

    // Create template
    await createTemplate({
        collection_name: COLLECTION_NAME,
        schema_name: SCHEMA_NAME,
        max_supply: MAX_SUPPLY_TEMPLATE,
        immutable_data: TEMPLATE_DATA
    })
    const templates = await getTemplates({
        collection_name: COLLECTION_NAME
    })

    // Create NFT
    await createNft({
        collection_name: COLLECTION_NAME,
        schema_name: SCHEMA_NAME,
        template_id: templates[templates.length - 1].template_id,
        immutable_data: NFT_IMMUTABLE_DATA,
        mutable_data: NFT_MUTABLE_DATA
    })

    /**
     * NFT Marketplace
     */
    // Sell NFT
    const nfts = await getNfts({
        owner: ACCOUNT
    })
    const nft = nfts[0]
    await sellNft({
        asset_ids: [nft.asset_id],
        listing_price: '1.0000 XPR',
        settlement_symbol: '4,XPR' // 4 is the precision of XPR
    })

    // Get Listings
    const listings = await getListings({
        seller: ACCOUNT,
        collection_name: COLLECTION_NAME
    })
    const listing = listings[0]

    // Buy NFT
    await buyNft({
        token_contract: listing.price.token_contract,
        quantity: `${(+listing.price.amount).toFixed(listing.price.token_precision)} ${listing.price.token_symbol}`,
        sale_id: listing.sale_id
    })

    // Unlist NFT
    await cancelNftSale({
        sale_id: listing.sale_id
    })

    // Transfer NFT
    await transferNft({
        to: 'syed',
        asset_ids: [nft.asset_id],
        memo: ''
    })
}

main()