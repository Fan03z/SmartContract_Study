const { expect, assert } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Random IPFS NFT Unit Tests", function () {
      let vrfCoordinatorV2Mock, deployer, randomIpfsNft;
      beforeEach(async function () {
        const accounts = ethers.getSigners();
        deployer = accounts[0];
        await deployments.fixture(["mocks", "randomipfs"]);
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        randomIpfsNft = await ethers.getContract("RandomIpfsNft");
      });

      // 测试constructor()
      describe("constructor", function () {
        it("Test1.初始值设置正确", async function () {
          const dogTokenUriZero = await randomIpfsNft.getDogTokenUris(0);
          const isInitialized = await randomIpfsNft.getInitialized();
          assert(dogTokenUriZero.includes("ipfs://"));
          assert.equal(isInitialized, true);
        });
      });

      // 测试requestNft()
      describe("requestNft", function () {
        it("Test2.未付铸造款会提示失败", async function () {
          await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
            "RandomIpfsNft__NeedMoreETHSent"
          );
        });

        it("Test3.付款少于铸造费用会提示失败", async function () {
          const fee = await randomIpfsNft.getMintFee();
          await expect(
            randomIpfsNft.requestNft({
              value: fee.sub(ethers.utils.parseEther("0.001")),
            })
          ).to.be.revertedWith("RandomIpfsNft__NeedMoreETHSent");
        });

        it("Test4.触发事件并成功发送随机数请求", async function () {
          const fee = await randomIpfsNft.getMintFee();
          await expect(
            randomIpfsNft.requestNft({ value: fee.toString() })
          ).to.emit(randomIpfsNft, "NftRequested");
        });
      });

      // 测试fulfillRandomWords()
      describe("fulfillRandomWords", function () {
        it("Test5.返回随机数并成功铸造NFT", async function () {
          //
          await new Promise(async (resolve, reject) => {
            randomIpfsNft.once("NftMinted", async () => {
              try {
                const tokenUri = await randomIpfsNft.tokenURI("0");
                const tokenCounter = await randomIpfsNft.getTokenCounter();
                assert.equal(tokenUri.includes("ipfs://"), true);
                assert.equal(tokenCounter.toString(), "1");
                resolve();
              } catch (e) {
                console.error(e);
                reject(e);
              }
            });
            try {
              const fee = await randomIpfsNft.getMintFee();
              const requestNftResponse = await randomIpfsNft.requestNft({
                value: fee.toString(),
              });
              const requestNftReceipt = await requestNftResponse.wait(1);
              await vrfCoordinatorV2Mock.fulfillRandomWords(
                requestNftReceipt.events[1].args.requestId,
                randomIpfsNft.address
              );
            } catch (e) {
              console.error(e);
              reject(e);
            }
          });
        });
      });

      // 测试getBreedFromModdedRng()
      describe("getBreedFromModdedRng", function () {
        it("Test6.当随机数 <10 时铸造得到pug", async function () {
          const expectedValue = await randomIpfsNft.getBreedFromModdedRng(7);
          assert.equal(0, expectedValue);
        });
        it("Test7.当随机数为 10~39 时铸造得到pug", async function () {
          const expectedValue = await randomIpfsNft.getBreedFromModdedRng(21);
          assert.equal(1, expectedValue);
        });
        it("Test8.当随机数为 40~99 时铸造得到pug", async function () {
          const expectedValue = await randomIpfsNft.getBreedFromModdedRng(77);
          assert.equal(2, expectedValue);
        });
        it("Test9.当随机数 >99 时提示错误", async function () {
          await expect(
            randomIpfsNft.getBreedFromModdedRng(177)
          ).to.be.revertedWith("RandomIpfsNft__RangeOutOfBounds");
        });
      });
    });
