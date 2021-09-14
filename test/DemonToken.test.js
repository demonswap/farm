const { assert } = require("chai");

const DemonToken = artifacts.require('DemonToken');

contract('DemonToken', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.demon = await DemonToken.new({ from: minter });
    });


    it('mint', async () => {
        await this.demon.mint(alice, 1000, { from: minter });
        assert.equal((await this.demon.balanceOf(alice)).toString(), '1000');
    })
});
