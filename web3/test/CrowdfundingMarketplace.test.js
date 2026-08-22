const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdfundingMarketplace", function () {
  let contract;
  let owner, creator, contributor1, contributor2, contributor3, nonContributor;
  const ONE_ETH = ethers.utils.parseEther("1");
  const FIVE_ETH = ethers.utils.parseEther("5");
  const TEN_ETH = ethers.utils.parseEther("10");
  const DURATION = 30 * 24 * 60 * 60; // 30 days

  beforeEach(async function () {
    [owner, creator, contributor1, contributor2, contributor3, nonContributor] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CrowdfundingMarketplace");
    contract = await Factory.deploy();
    await contract.deployed();
  });

  // ============================
  // Campaign Creation
  // ============================
  describe("Campaign Creation", function () {
    it("should create a campaign successfully", async function () {
      await contract.connect(creator).createCampaign(
        "Test Campaign", "Description", "QmHash1", TEN_ETH, DURATION
      );
      const campaign = await contract.getCampaign(1);
      expect(campaign.title).to.equal("Test Campaign");
      expect(campaign.creator).to.equal(creator.address);
      expect(campaign.targetAmount).to.equal(TEN_ETH);
      expect(campaign.raisedAmount).to.equal(0);
      expect(campaign.active).to.equal(true);
      expect(campaign.withdrawn).to.equal(false);
    });

    it("should reject empty title", async function () {
      await expect(
        contract.connect(creator).createCampaign("", "Desc", "QmHash1", TEN_ETH, DURATION)
      ).to.be.revertedWith("Title cannot be empty");
    });

    it("should reject zero target amount", async function () {
      await expect(
        contract.connect(creator).createCampaign("Title", "Desc", "QmHash1", 0, DURATION)
      ).to.be.revertedWith("Target amount must be greater than 0");
    });

    it("should reject zero duration", async function () {
      await expect(
        contract.connect(creator).createCampaign("Title", "Desc", "QmHash1", TEN_ETH, 0)
      ).to.be.revertedWith("Duration must be greater than 0");
    });

    it("should track user campaigns", async function () {
      await contract.connect(creator).createCampaign(
        "Campaign 1", "Desc", "QmHash1", TEN_ETH, DURATION
      );
      await contract.connect(creator).createCampaign(
        "Campaign 2", "Desc", "QmHash2", FIVE_ETH, DURATION
      );
      const userCampaigns = await contract.getUserCampaigns(creator.address);
      expect(userCampaigns.length).to.equal(2);
      expect(userCampaigns[0]).to.equal(1);
      expect(userCampaigns[1]).to.equal(2);
    });

    it("should increment campaign counter", async function () {
      await contract.connect(creator).createCampaign(
        "Campaign 1", "Desc", "QmHash1", TEN_ETH, DURATION
      );
      expect(await contract.campaignCounter()).to.equal(1);
      await contract.connect(creator).createCampaign(
        "Campaign 2", "Desc", "QmHash2", TEN_ETH, DURATION
      );
      expect(await contract.campaignCounter()).to.equal(2);
    });
  });

  // ============================
  // Contributions
  // ============================
  describe("Contributions", function () {
    beforeEach(async function () {
      await contract.connect(creator).createCampaign(
        "Test Campaign", "Description", "QmHash1", TEN_ETH, DURATION
      );
    });

    it("should accept contributions", async function () {
      await contract.connect(contributor1).contributeToCampaign(1, { value: ONE_ETH });
      const contribution = await contract.getContribution(1, contributor1.address);
      expect(contribution).to.equal(ONE_ETH);
      const campaign = await contract.getCampaign(1);
      expect(campaign.raisedAmount).to.equal(ONE_ETH);
      expect(campaign.contributorsCount).to.equal(1);
    });

    it("should track multiple contributions from same user", async function () {
      await contract.connect(contributor1).contributeToCampaign(1, { value: ONE_ETH });
      await contract.connect(contributor1).contributeToCampaign(1, { value: ONE_ETH });
      const contribution = await contract.getContribution(1, contributor1.address);
      expect(contribution).to.equal(ethers.utils.parseEther("2"));
      const campaign = await contract.getCampaign(1);
      expect(campaign.contributorsCount).to.equal(1); // Same contributor
    });

    it("should not allow creator to contribute to own campaign", async function () {
      await expect(
        contract.connect(creator).contributeToCampaign(1, { value: ONE_ETH })
      ).to.be.revertedWith("Cannot contribute to own campaign");
    });

    it("should reject zero contributions", async function () {
      await expect(
        contract.connect(contributor1).contributeToCampaign(1, { value: 0 })
      ).to.be.revertedWith("Contribution must be greater than 0");
    });

    it("should track user contributions", async function () {
      await contract.connect(contributor1).contributeToCampaign(1, { value: ONE_ETH });
      const userContribs = await contract.getUserContributions(contributor1.address);
      expect(userContribs.length).to.equal(1);
      expect(userContribs[0]).to.equal(1);
    });

    it("should get campaign contributions", async function () {
      await contract.connect(contributor1).contributeToCampaign(1, { value: ONE_ETH });
      await contract.connect(contributor2).contributeToCampaign(1, { value: FIVE_ETH });
      const contribs = await contract.getCampaignContributions(1);
      expect(contribs.length).to.equal(2);
    });
  });

  // ============================
  // CRITICAL FIX: Refund Accounting
  // ============================
  describe("Refunds (Critical Accounting Fix)", function () {
    beforeEach(async function () {
      // Create campaign with target HIGHER than contributions so it fails
      await contract.connect(creator).createCampaign(
        "Test Campaign", "Description", "QmHash1", ethers.utils.parseEther("20"), DURATION
      );
      await contract.connect(contributor1).contributeToCampaign(1, { value: FIVE_ETH });
      await contract.connect(contributor2).contributeToCampaign(1, { value: FIVE_ETH });
    });

    it("should refund and update raisedAmount (CRITICAL FIX)", async function () {
      // Advance time past deadline
      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine");

      const contractBalanceBefore = await ethers.provider.getBalance(contract.address);
      const raisedBefore = (await contract.getCampaign(1)).raisedAmount;

      await contract.connect(contributor1).getRefund(1);

      const raisedAfter = (await contract.getCampaign(1)).raisedAmount;
      const contractBalanceAfter = await ethers.provider.getBalance(contract.address);

      // raisedAmount MUST decrease by refund amount
      expect(raisedAfter).to.equal(raisedBefore.sub(FIVE_ETH));
      // Contract balance MUST also decrease
      expect(contractBalanceAfter).to.equal(contractBalanceBefore.sub(FIVE_ETH));
    });

    it("should zero out contributor balance after refund", async function () {
      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine");

      await contract.connect(contributor1).getRefund(1);
      const contribution = await contract.getContribution(1, contributor1.address);
      expect(contribution).to.equal(0);
    });

    it("should prevent double refund", async function () {
      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine");

      await contract.connect(contributor1).getRefund(1);
      await expect(
        contract.connect(contributor1).getRefund(1)
      ).to.be.revertedWith("No contribution found");
    });

    it("should reject refund on successful campaign", async function () {
      // Create a separate campaign that reaches its target
      await contract.connect(creator).createCampaign(
        "Successful Campaign", "Desc", "QmHash2", FIVE_ETH, DURATION
      );
      await contract.connect(contributor1).contributeToCampaign(2, { value: FIVE_ETH });

      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine");

      await expect(
        contract.connect(contributor1).getRefund(2)
      ).to.be.revertedWith("Campaign was successful");
    });

    it("should reject refund from non-contributor", async function () {
      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine");

      await expect(
        contract.connect(nonContributor).getRefund(1)
      ).to.be.revertedWith("No contribution found");
    });

    it("should maintain contract solvency after multiple refunds", async function () {
      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine");

      await contract.connect(contributor1).getRefund(1);
      await contract.connect(contributor2).getRefund(1);

      const campaign = await contract.getCampaign(1);
      expect(campaign.raisedAmount).to.equal(0);

      const contractBalance = await ethers.provider.getBalance(contract.address);
      expect(contractBalance).to.equal(0);
    });
  });

  // ============================
  // CRITICAL FIX: Withdraw Campaign Funds
  // ============================
  describe("Withdraw Campaign Funds (Critical Accounting Fix)", function () {
    beforeEach(async function () {
      await contract.connect(creator).createCampaign(
        "Test Campaign", "Description", "QmHash1", FIVE_ETH, DURATION
      );
      await contract.connect(contributor1).contributeToCampaign(1, { value: FIVE_ETH });
    });

    it("should withdraw all funds when no milestones released", async function () {
      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine");

      const balanceBefore = await ethers.provider.getBalance(creator.address);
      await contract.connect(creator).withdrawCampaignFunds(1);
      const balanceAfter = await ethers.provider.getBalance(creator.address);

      // Creator should receive 5 ETH (minus gas)
      expect(balanceAfter).to.be.gt(balanceBefore);

      const campaign = await contract.getCampaign(1);
      expect(campaign.withdrawn).to.equal(true);
    });

    it("should only withdraw remaining amount after milestone releases (CRITICAL FIX)", async function () {
      // Add milestones during active campaign
      await contract.connect(creator).addCampaignMilestone(
        1, "Milestone 1", "Desc", ethers.utils.parseEther("2")
      );
      await contract.connect(creator).addCampaignMilestone(
        1, "Milestone 2", "Desc", ethers.utils.parseEther("3")
      );

      // Vote and release milestone 1
      await contract.connect(creator).requestMilestoneVote(1, 0);
      await contract.connect(contributor1).voteOnMilestone(1, 0, true);
      await contract.connect(creator).releaseMilestoneFunds(1, 0);

      // Campaign should have 5 ETH raised, 2 ETH released
      const released = await contract.getReleasedAmount(1);
      expect(released).to.equal(ethers.utils.parseEther("2"));

      // Withdraw remaining: 5 - 2 = 3 ETH
      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine");

      const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);
      await contract.connect(creator).withdrawCampaignFunds(1);
      const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);

      // Should receive approximately 3 ETH (minus gas)
      const difference = creatorBalanceAfter.sub(creatorBalanceBefore);
      expect(difference).to.be.gt(ethers.utils.parseEther("2.9"));
      expect(difference).to.be.lt(ethers.utils.parseEther("3.1"));

      const campaign = await contract.getCampaign(1);
      expect(campaign.withdrawn).to.equal(true);
    });

    it("should prevent double withdrawal", async function () {
      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine");

      await contract.connect(creator).withdrawCampaignFunds(1);
      await expect(
        contract.connect(creator).withdrawCampaignFunds(1)
      ).to.be.revertedWith("Funds already withdrawn");
    });

    it("should only allow creator to withdraw", async function () {
      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine");

      await expect(
        contract.connect(contributor1).withdrawCampaignFunds(1)
      ).to.be.revertedWith("Not campaign creator");
    });

    it("should require campaign to have ended", async function () {
      await expect(
        contract.connect(creator).withdrawCampaignFunds(1)
      ).to.be.revertedWith("Campaign still active");
    });

    it("should require target reached", async function () {
      // Create campaign with high target
      await contract.connect(creator).createCampaign(
        "High Target", "Desc", "QmHash2", ethers.utils.parseEther("100"), DURATION
      );
      await contract.connect(contributor1).contributeToCampaign(2, { value: ONE_ETH });

      await ethers.provider.send("evm_increaseTime", [DURATION + 1]);
      await ethers.provider.send("evm_mine");

      await expect(
        contract.connect(creator).withdrawCampaignFunds(2)
      ).to.be.revertedWith("Campaign target not reached");
    });
  });

  // ============================
  // Milestones
  // ============================
  describe("Milestones", function () {
    beforeEach(async function () {
      await contract.connect(creator).createCampaign(
        "Test Campaign", "Description", "QmHash1", TEN_ETH, DURATION
      );
      await contract.connect(contributor1).contributeToCampaign(1, { value: FIVE_ETH });
      await contract.connect(contributor2).contributeToCampaign(1, { value: FIVE_ETH });
    });

    it("should add milestone", async function () {
      await contract.connect(creator).addCampaignMilestone(
        1, "Milestone 1", "Description", ethers.utils.parseEther("3")
      );
      const count = await contract.getMilestoneCount(1);
      expect(count).to.equal(1);

      const milestone = await contract.getMilestone(1, 0);
      expect(milestone.title).to.equal("Milestone 1");
      expect(milestone.amount).to.equal(ethers.utils.parseEther("3"));
      expect(milestone.completed).to.equal(false);
      expect(milestone.fundsReleased).to.equal(false);
    });

    it("should get all milestones in batch", async function () {
      await contract.connect(creator).addCampaignMilestone(
        1, "Milestone 1", "Desc", ethers.utils.parseEther("3")
      );
      await contract.connect(creator).addCampaignMilestone(
        1, "Milestone 2", "Desc", ethers.utils.parseEther("4")
      );
      const milestones = await contract.getMilestones(1);
      expect(milestones.length).to.equal(2);
      expect(milestones[0].title).to.equal("Milestone 1");
      expect(milestones[1].title).to.equal("Milestone 2");
    });

    it("should prevent milestone allocation exceeding target", async function () {
      await expect(
        contract.connect(creator).addCampaignMilestone(
          1, "Big Milestone", "Desc", ethers.utils.parseEther("11")
        )
      ).to.be.revertedWith("Milestone allocation exceeds target");
    });

    it("should request vote", async function () {
      await contract.connect(creator).addCampaignMilestone(
        1, "Milestone 1", "Desc", ethers.utils.parseEther("3")
      );
      await contract.connect(creator).requestMilestoneVote(1, 0);
      const milestone = await contract.getMilestone(1, 0);
      expect(milestone.voteRequested).to.equal(true);
      expect(milestone.completed).to.equal(true);
    });

    it("should vote on milestone", async function () {
      await contract.connect(creator).addCampaignMilestone(
        1, "Milestone 1", "Desc", ethers.utils.parseEther("3")
      );
      await contract.connect(creator).requestMilestoneVote(1, 0);
      await contract.connect(contributor1).voteOnMilestone(1, 0, true);

      const milestone = await contract.getMilestone(1, 0);
      expect(milestone.approvals).to.equal(1);
      expect(milestone.rejections).to.equal(0);
    });

    it("should prevent double voting", async function () {
      await contract.connect(creator).addCampaignMilestone(
        1, "Milestone 1", "Desc", ethers.utils.parseEther("3")
      );
      await contract.connect(creator).requestMilestoneVote(1, 0);
      await contract.connect(contributor1).voteOnMilestone(1, 0, true);
      await expect(
        contract.connect(contributor1).voteOnMilestone(1, 0, true)
      ).to.be.revertedWith("Contributor already voted");
    });

    it("should prevent non-contributor from voting", async function () {
      await contract.connect(creator).addCampaignMilestone(
        1, "Milestone 1", "Desc", ethers.utils.parseEther("3")
      );
      await contract.connect(creator).requestMilestoneVote(1, 0);
      await expect(
        contract.connect(nonContributor).voteOnMilestone(1, 0, true)
      ).to.be.revertedWith("Only contributors can vote");
    });

    it("should release milestone funds with majority approval", async function () {
      await contract.connect(creator).addCampaignMilestone(
        1, "Milestone 1", "Desc", ethers.utils.parseEther("3")
      );
      await contract.connect(creator).requestMilestoneVote(1, 0);

      // Both contributors approve (100% approval)
      await contract.connect(contributor1).voteOnMilestone(1, 0, true);
      await contract.connect(contributor2).voteOnMilestone(1, 0, true);

      const releasedBefore = await contract.getReleasedAmount(1);
      await contract.connect(creator).releaseMilestoneFunds(1, 0);
      const releasedAfter = await contract.getReleasedAmount(1);

      expect(releasedAfter).to.equal(releasedBefore.add(ethers.utils.parseEther("3")));

      const milestone = await contract.getMilestone(1, 0);
      expect(milestone.fundsReleased).to.equal(true);
    });

    it("should prevent release without majority", async function () {
      await contract.connect(creator).addCampaignMilestone(
        1, "Milestone 1", "Desc", ethers.utils.parseEther("3")
      );
      await contract.connect(creator).requestMilestoneVote(1, 0);

      // Only 1 of 2 approve (50% - not majority)
      await contract.connect(contributor1).voteOnMilestone(1, 0, true);
      await contract.connect(contributor2).voteOnMilestone(1, 0, false);

      await expect(
        contract.connect(creator).releaseMilestoneFunds(1, 0)
      ).to.be.revertedWith("Majority approval required");
    });

    it("should prevent double release", async function () {
      await contract.connect(creator).addCampaignMilestone(
        1, "Milestone 1", "Desc", ethers.utils.parseEther("3")
      );
      await contract.connect(creator).requestMilestoneVote(1, 0);
      await contract.connect(contributor1).voteOnMilestone(1, 0, true);
      await contract.connect(contributor2).voteOnMilestone(1, 0, true);

      await contract.connect(creator).releaseMilestoneFunds(1, 0);
      await expect(
        contract.connect(creator).releaseMilestoneFunds(1, 0)
      ).to.be.revertedWith("Funds already released");
    });
  });

  // ============================
  // Admin Functions
  // ============================
  describe("Admin Functions", function () {
    it("should allow owner to pause/unpause", async function () {
      await contract.connect(owner).pause();
      expect(await contract.paused()).to.equal(true);

      await contract.connect(owner).unpause();
      expect(await contract.paused()).to.equal(false);
    });

    it("should prevent non-owner from pausing", async function () {
      await expect(
        contract.connect(creator).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should allow owner to deactivate/reactivate campaigns", async function () {
      await contract.connect(creator).createCampaign(
        "Test", "Desc", "QmHash1", TEN_ETH, DURATION
      );
      await contract.connect(owner).deactivateCampaign(1);
      const campaign = await contract.getCampaign(1);
      expect(campaign.active).to.equal(false);

      await contract.connect(owner).reactivateCampaign(1);
      const campaign2 = await contract.getCampaign(1);
      expect(campaign2.active).to.equal(true);
    });

    it("should prevent non-owner from deactivating", async function () {
      await contract.connect(creator).createCampaign(
        "Test", "Desc", "QmHash1", TEN_ETH, DURATION
      );
      await expect(
        contract.connect(creator).deactivateCampaign(1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should prevent creating campaign when paused", async function () {
      await contract.connect(owner).pause();
      await expect(
        contract.connect(creator).createCampaign(
          "Test", "Desc", "QmHash1", TEN_ETH, DURATION
        )
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  // ============================
  // View Functions
  // ============================
  describe("View Functions", function () {
    it("should get campaign stats", async function () {
      await contract.connect(creator).createCampaign(
        "Test", "Desc", "QmHash1", TEN_ETH, DURATION
      );
      await contract.connect(contributor1).contributeToCampaign(1, { value: FIVE_ETH });

      const stats = await contract.getCampaignStats(1);
      expect(stats.raisedAmount).to.equal(FIVE_ETH);
      expect(stats.targetAmount).to.equal(TEN_ETH);
      expect(stats.contributorsCount).to.equal(1);
      expect(stats.isActive).to.equal(true);
    });

    it("should get contract stats", async function () {
      await contract.connect(creator).createCampaign(
        "Test", "Desc", "QmHash1", TEN_ETH, DURATION
      );
      const stats = await contract.getContractStats();
      expect(stats.totalCampaigns).to.equal(1);
    });

    it("should get released amount", async function () {
      await contract.connect(creator).createCampaign(
        "Test", "Desc", "QmHash1", TEN_ETH, DURATION
      );
      const released = await contract.getReleasedAmount(1);
      expect(released).to.equal(0);
    });

    it("should check if campaign is successful", async function () {
      await contract.connect(creator).createCampaign(
        "Test", "Desc", "QmHash1", ONE_ETH, DURATION
      );
      expect(await contract.isCampaignSuccessful(1)).to.equal(false);

      await contract.connect(contributor1).contributeToCampaign(1, { value: ONE_ETH });
      expect(await contract.isCampaignSuccessful(1)).to.equal(true);
    });

    it("should get active campaigns", async function () {
      await contract.connect(creator).createCampaign(
        "Test 1", "Desc", "QmHash1", TEN_ETH, DURATION
      );
      await contract.connect(creator).createCampaign(
        "Test 2", "Desc", "QmHash2", TEN_ETH, DURATION
      );
      const active = await contract.getActiveCampaigns(0, 10);
      expect(active.length).to.equal(2);
    });

    it("should reject invalid campaign ID", async function () {
      await expect(contract.getCampaign(99)).to.be.revertedWith("Invalid campaign ID");
    });
  });

  // ============================
  // Emergency Functions
  // ============================
  describe("Emergency Functions", function () {
    it("should allow owner to emergency refund", async function () {
      await contract.connect(creator).createCampaign(
        "Test", "Desc", "QmHash1", TEN_ETH, DURATION
      );
      await contract.connect(contributor1).contributeToCampaign(1, { value: FIVE_ETH });

      await contract.connect(owner).emergencyRefund(1, contributor1.address);

      const contribution = await contract.getContribution(1, contributor1.address);
      expect(contribution).to.equal(0);

      const campaign = await contract.getCampaign(1);
      expect(campaign.raisedAmount).to.equal(0);
    });

    it("should prevent non-owner from emergency refund", async function () {
      await contract.connect(creator).createCampaign(
        "Test", "Desc", "QmHash1", TEN_ETH, DURATION
      );
      await contract.connect(contributor1).contributeToCampaign(1, { value: FIVE_ETH });

      await expect(
        contract.connect(creator).emergencyRefund(1, contributor1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
