const dotmed = artifacts.require('./dotmed.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('dotmed', ([deployer, author, tipper]) => {
    let dotmed

    before(async () => {
        dotmed = await dotmed.deployed()
    })

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = await dotmed.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has a name', async () => {
            const name = await dotmed.name()
            assert.equal(name, 'dotmed')
        })
    })


})