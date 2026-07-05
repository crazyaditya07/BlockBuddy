const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PublicMessageBoard", function () {
  let publicMessageBoard;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const PublicMessageBoard = await ethers.getContractFactory("PublicMessageBoard");
    publicMessageBoard = await PublicMessageBoard.deploy();
    await publicMessageBoard.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should start with 0 messages", async function () {
      expect(await publicMessageBoard.getMessageCount()).to.equal(0);
    });
  });

  describe("Posting Messages", function () {
    it("Should increment getMessageCount()", async function () {
      await publicMessageBoard.postMessage("Hello World!");
      expect(await publicMessageBoard.getMessageCount()).to.equal(1);
    });

    it("Should return correct message data using getMessage", async function () {
      const content = "Hello decentralized world!";
      await publicMessageBoard.connect(addr1).postMessage(content);

      const [sender, msgContent, timestamp] = await publicMessageBoard.getMessage(0);

      expect(sender).to.equal(addr1.address);
      expect(msgContent).to.equal(content);
      expect(timestamp).to.be.gt(0);
    });

    it("Should revert if index is out of range", async function () {
      await expect(publicMessageBoard.getMessage(0)).to.be.revertedWith("Message does not exist");
    });

    it("Should record the correct sender for different accounts", async function () {
      await publicMessageBoard.connect(addr1).postMessage("Message 1");
      await publicMessageBoard.connect(addr2).postMessage("Message 2");

      const [sender1] = await publicMessageBoard.getMessage(0);
      const [sender2] = await publicMessageBoard.getMessage(1);

      expect(sender1).to.equal(addr1.address);
      expect(sender2).to.equal(addr2.address);
    });

    it("Should reject empty messages", async function () {
      await expect(publicMessageBoard.postMessage("")).to.be.revertedWith("Message cannot be empty");
    });

    it("Should reject messages exceeding 280 characters", async function () {
      const longMessage = "a".repeat(281);
      await expect(publicMessageBoard.postMessage(longMessage)).to.be.revertedWith("Message exceeds 280 characters");
    });
  });

  describe("Batch Read (getMessages)", function () {
    beforeEach(async function () {
      await publicMessageBoard.connect(addr1).postMessage("Msg 1");
      await publicMessageBoard.connect(addr2).postMessage("Msg 2");
      await publicMessageBoard.connect(addr1).postMessage("Msg 3");
    });

    it("Should fetch a partial range", async function () {
      const messages = await publicMessageBoard.getMessages(0, 2);
      expect(messages.length).to.equal(2);
      expect(messages[0].content).to.equal("Msg 1");
      expect(messages[1].content).to.equal("Msg 2");
    });

    it("Should fetch a full range", async function () {
      const messages = await publicMessageBoard.getMessages(0, 3);
      expect(messages.length).to.equal(3);
      expect(messages[0].content).to.equal("Msg 1");
      expect(messages[1].content).to.equal("Msg 2");
      expect(messages[2].content).to.equal("Msg 3");
    });

    it("Should cap end index if count is larger than message list length", async function () {
      const messages = await publicMessageBoard.getMessages(1, 5);
      expect(messages.length).to.equal(2);
      expect(messages[0].content).to.equal("Msg 2");
      expect(messages[1].content).to.equal("Msg 3");
    });

    it("Should revert if start is out of range", async function () {
      await expect(publicMessageBoard.getMessages(3, 1)).to.be.revertedWith("Start out of range");
      await expect(publicMessageBoard.getMessages(99, 1)).to.be.revertedWith("Start out of range");
    });

    it("Should return empty list for 0 messages if list is empty", async function () {
      const PublicMessageBoard = await ethers.getContractFactory("PublicMessageBoard");
      const emptyBoard = await PublicMessageBoard.deploy();
      await emptyBoard.waitForDeployment();
      
      const messages = await emptyBoard.getMessages(0, 5);
      expect(messages.length).to.equal(0);
    });
  });
});
