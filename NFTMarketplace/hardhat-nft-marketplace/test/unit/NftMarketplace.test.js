const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft Marketplace Unit Tests", () => {
      let nftMarketplace, nftMarketplaceContract, basicNft, basicNftContract;
      const PRICE = ethers.utils.parseEther("0.1");
      let TOKEN_ID = 0;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];
        await deployments.fixture(["all"]);
        nftMarketplaceContract = await ethers.getContract("NftMarketplace");
        nftMarketplace = nftMarketplaceContract.connect(deployer);
        basicNftContract = await ethers.getContract("BasicNft");
        basicNft = basicNftContract.connect(deployer);
        await basicNft.mintNft();
        await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID);
      });

      // 测试listItem()
      describe("listItem", () => {
        it("Test1.NFT挂上市场后触发ItemListed事件", async () => {
          expect(
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.emit("ItemListed");
        });
        it("Test2.只能操作未挂上市场出售的NFT", async () => {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const error = `AlreadyListed("${basicNft.address}", ${TOKEN_ID})`;
          // 注意expect中的await
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith(error);
        });
        it("Test3.只允许NFT拥有者挂出市场出售", async () => {
          nftMarketplace = await nftMarketplace.connect(user);
          await basicNft.approve(user.address, TOKEN_ID);
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NotOwner");
        });
        it("Test4.NFT挂出市场前需要得到授权流动", async () => {
          // 授权虚假地址
          await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID);
          await expect(
            nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
          ).to.be.revertedWith("NotApprovedForMarketplace");
        });
        it("Test5.更新挂出NFT的卖家和价格信息", async () => {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          const listing = await nftMarketplace.getListing(
            basicNft.address,
            TOKEN_ID
          );
          assert(listing.seller.toString() == deployer.address);
          assert(listing.price.toString() == PRICE.toString());
        });
      });

      // 测试cancelListing()
      describe("cancelListing", () => {
        it("Test6.若NFT未挂上市场则提示错误", async () => {
          const error = `NotListed("${basicNft.address}", ${TOKEN_ID})`;
          await expect(
            nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith(error);
        });
        it("Test7.非拥有者撤回出售NFT则提示错误", async () => {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          nftMarketplace = nftMarketplaceContract.connect(user);
          await basicNft.approve(user.address, TOKEN_ID);
          await expect(
            nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
          ).to.be.revertedWith("NotOwner");
        });
        it("Test8.撤回出售并触发ItemCanceled事件", async () => {
          await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
          expect(
            await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
          ).to.emit("ItemCanceled");
          const listing = await nftMarketplace.getListing(
            basicNft.address,
            TOKEN_ID
          );
          assert(listing.price.toString() == "0");
        });

        // 测试buyItem()
        describe("buyItem", () => {
          it("Test9.购买的NFT未挂上市场提示错误", async () => {
            await expect(
              nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
            ).to.be.revertedWith("NotListed");
          });
          it("Test10.支付不到购买价格提示错误", async () => {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            await expect(
              nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
            ).to.be.revertedWith("PriceNotMet");
          });
          it("Test11.转移NFT给购买者并更新卖家售出钱款", async () => {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            nftMarketplace = nftMarketplaceContract.connect(user);
            expect(
              await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                value: PRICE,
              })
            ).to.emit("ItemBought");
            const newOwner = await basicNft.ownerOf(TOKEN_ID);
            const deployerProceeds = await nftMarketplace.getProceeds(
              deployer.address
            );
            assert(newOwner.toString() == user.address);
            assert(deployerProceeds.toString() == PRICE.toString());
          });
        });

        // 测试updateListing()
        describe("updateListing", () => {
          it("Test12.必须为拥有者调用且NFT已经挂上市场", async () => {
            await expect(
              nftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE)
            ).to.be.revertedWith("NotListed");
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            nftMarketplace = nftMarketplaceContract.connect(user);
            await expect(
              nftMarketplace.updateListing(basicNft.address, TOKEN_ID, PRICE)
            ).to.be.revertedWith("NotOwner");
          });
          it("Test13.更新NFT价格信息", async () => {
            const updatedPrice = ethers.utils.parseEther("0.2");
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            expect(
              await nftMarketplace.updateListing(
                basicNft.address,
                TOKEN_ID,
                updatedPrice
              )
            ).to.emit("ItemListed");
            const listing = await nftMarketplace.getListing(
              basicNft.address,
              TOKEN_ID
            );
            assert(listing.price.toString() == updatedPrice.toString());
          });
        });

        // 测试withdrawProceeds()
        describe("withdrawProceeds", () => {
          it("Test14.账户款没钱时提示错误", async () => {
            await expect(nftMarketplace.withdrawProceeds()).to.be.revertedWith(
              "NoProceeds"
            );
          });
          it("Test15.提取账户款", async () => {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
            nftMarketplace = nftMarketplaceContract.connect(user);
            await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
              value: PRICE,
            });
            nftMarketplace = nftMarketplaceContract.connect(deployer);

            const deployerProceedsBefore = await nftMarketplace.getProceeds(
              deployer.address
            );
            const deployerBalanceBefore = await deployer.getBalance();
            const txResponse = await nftMarketplace.withdrawProceeds();
            const transactionReceipt = await txResponse.wait(1);
            // 计算gas花费
            const { gasUsed, effectiveGasPrice } = transactionReceipt;
            const gasCost = gasUsed.mul(effectiveGasPrice);
            const deployerBalanceAfter = await deployer.getBalance();

            assert(
              deployerBalanceAfter.add(gasCost).toString() ==
                deployerProceedsBefore.add(deployerBalanceBefore).toString()
            );
          });
        });
      });
    });
