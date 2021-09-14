const { advanceBlockTo } = require('@openzeppelin/test-helpers/src/time');
const { assert } = require('chai');
const DemonToken = artifacts.require('DemonToken');
const SyrupBar = artifacts.require('SyrupBar');

contract('SyrupBar', ([alice, bob, carol, dev, minter]) => {
  beforeEach(async () => {
    this.demon = await DemonToken.new({ from: minter });
    this.syrup = await SyrupBar.new(this.demon.address, { from: minter });
  });

  it('mint', async () => {
    await this.syrup.mint(alice, 1000, { from: minter });
    assert.equal((await this.syrup.balanceOf(alice)).toString(), '1000');
  });

  it('burn', async () => {
    await advanceBlockTo('650');
    await this.syrup.mint(alice, 1000, { from: minter });
    await this.syrup.mint(bob, 1000, { from: minter });
    assert.equal((await this.syrup.totalSupply()).toString(), '2000');
    await this.syrup.burn(alice, 200, { from: minter });

    assert.equal((await this.syrup.balanceOf(alice)).toString(), '800');
    assert.equal((await this.syrup.totalSupply()).toString(), '1800');
  });

  it('safeDemonTransfer', async () => {
    assert.equal(
      (await this.demon.balanceOf(this.syrup.address)).toString(),
      '0'
    );
    await this.demon.mint(this.syrup.address, 1000, { from: minter });
    await this.syrup.safeDemonTransfer(bob, 200, { from: minter });
    assert.equal((await this.demon.balanceOf(bob)).toString(), '200');
    assert.equal(
      (await this.demon.balanceOf(this.syrup.address)).toString(),
      '800'
    );
    await this.syrup.safeDemonTransfer(bob, 2000, { from: minter });
    assert.equal((await this.demon.balanceOf(bob)).toString(), '1000');
  });
});
