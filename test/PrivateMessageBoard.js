const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivateMessageBoard", function () {
  let privateMessageBoard;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const PrivateMessageBoard = await ethers.getContractFactory("PrivateMessageBoard");
    privateMessageBoard = await PrivateMessageBoard.deploy();
    await privateMessageBoard.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should start with 0 messages", async function () {
      expect(await privateMessageBoard.getMessageCount()).to.equal(0);
    });
  });

  describe("Posting Messages", function () {
    it("Should increment getMessageCount()", async function () {
      await privateMessageBoard.postMessage("Hello World!");
      expect(await privateMessageBoard.getMessageCount()).to.equal(1);

      await privateMessageBoard.postMessage("Another message");
      expect(await privateMessageBoard.getMessageCount()).to.equal(2);
    });

    it("Should return correct message data using getMessage", async function () {
      const content = "Hello decentralized world!";
      await privateMessageBoard.connect(addr1).postMessage(content);

      const [sender, msgContent, timestamp] = await privateMessageBoard.getMessage(0);

      expect(sender).to.equal(addr1.address);
      expect(msgContent).to.equal(content);
      expect(timestamp).to.be.gt(0);
    });

    it("Should revert if index is out of range", async function () {
      await expect(privateMessageBoard.getMessage(0)).to.be.revertedWith("Message does not exist");
      await expect(privateMessageBoard.getMessage(99)).to.be.revertedWith("Message does not exist");
    });

    it("Should record the correct sender for different accounts", async function () {
      await privateMessageBoard.connect(addr1).postMessage("Message 1");
      await privateMessageBoard.connect(addr2).postMessage("Message 2");

      const [sender1] = await privateMessageBoard.getMessage(0);
      const [sender2] = await privateMessageBoard.getMessage(1);

      expect(sender1).to.equal(addr1.address);
      expect(sender2).to.equal(addr2.address);
    });
  });
});
