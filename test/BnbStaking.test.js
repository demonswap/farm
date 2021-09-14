const { expectRevert, time } = require('@openzeppelin/test-helpers');
const { assert } = require('chai');
const DemonToken = artifacts.require('DemonToken');
const FtmStaking = artifacts.require('FtmStaking');
const MockBEP20 = artifacts.require('libs/MockBEP20');
const WFTM = artifacts.require('libs/WFTM');

contract('FtmStaking.......', async ([alice, bob, admin, dev, minter]) => {
  beforeEach(async () => {
    this.rewardToken = await DemonToken.new({ from: minter });
    this.lpToken = await MockBEP20.new('LPToken', 'LP1', '1000000', {
      from: minter,
    });
    this.wFTM = await WFTM.new({ from: minter });
    this.ftmChef = await FtmStaking.new(
      this.wFTM.address,
      this.rewardToken.address,
      1000,
      10,
      1010,
      admin,
      this.wFTM.address,
      { from: minter }
    );
    await this.rewardToken.mint(this.ftmChef.address, 100000, { from: minter });
  });

  it('deposit/withdraw', async () => {
    await time.advanceBlockTo('10');
    await this.ftmChef.deposit({ from: alice, value: 100 });
    await this.ftmChef.deposit({ from: bob, value: 200 });
    assert.equal(
      (await this.wFTM.balanceOf(this.ftmChef.address)).toString(),
      '300'
    );
    assert.equal((await this.ftmChef.pendingReward(alice)).toString(), '1000');
    await this.ftmChef.deposit({ from: alice, value: 300 });
    assert.equal((await this.ftmChef.pendingReward(alice)).toString(), '0');
    assert.equal((await this.rewardToken.balanceOf(alice)).toString(), '1333');
    await this.ftmChef.withdraw('100', { from: alice });
    assert.equal(
      (await this.wFTM.balanceOf(this.ftmChef.address)).toString(),
      '500'
    );
    await this.ftmChef.emergencyRewardWithdraw(1000, { from: minter });
    assert.equal((await this.ftmChef.pendingReward(bob)).toString(), '1399');
  });

  it('should block man who in blanklist', async () => {
    await this.ftmChef.setBlackList(alice, { from: admin });
    await expectRevert(
      this.ftmChef.deposit({ from: alice, value: 100 }),
      'in black list'
    );
    await this.ftmChef.removeBlackList(alice, { from: admin });
    await this.ftmChef.deposit({ from: alice, value: 100 });
    await this.ftmChef.setAdmin(dev, { from: minter });
    await expectRevert(
      this.ftmChef.setBlackList(alice, { from: admin }),
      'admin: wut?'
    );
  });

  it('emergencyWithdraw', async () => {
    await this.ftmChef.deposit({ from: alice, value: 100 });
    await this.ftmChef.deposit({ from: bob, value: 200 });
    assert.equal(
      (await this.wFTM.balanceOf(this.ftmChef.address)).toString(),
      '300'
    );
    await this.ftmChef.emergencyWithdraw({ from: alice });
    assert.equal(
      (await this.wFTM.balanceOf(this.ftmChef.address)).toString(),
      '200'
    );
    assert.equal((await this.wFTM.balanceOf(alice)).toString(), '100');
  });

  it('emergencyRewardWithdraw', async () => {
    await expectRevert(
      this.ftmChef.emergencyRewardWithdraw(100, { from: alice }),
      'caller is not the owner'
    );
    await this.ftmChef.emergencyRewardWithdraw(1000, { from: minter });
    assert.equal((await this.rewardToken.balanceOf(minter)).toString(), '1000');
  });

  it('setLimitAmount', async () => {
    // set limit to 1e-12 BNB
    await this.ftmChef.setLimitAmount('1000000', { from: minter });
    await expectRevert(
      this.ftmChef.deposit({ from: alice, value: 100000000 }),
      'exceed the to'
    );
  });
});
