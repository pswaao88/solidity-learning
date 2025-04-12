import hre from "hardhat";
import { expect } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const mintingAmount = 100n;
const decimal = 18n;

describe("My Token", () => {
  let myTokenC: MyToken;
  let signers: HardhatEthersSigner[];
  // before는 테스트 실행하기전에 1번 실행
  // => 한번의 설정으로 변경된것을 사용할 때 dependency가 필요할 때
  // beforeEach는 각테스트 별로 실행
  // => 테스트코드가 별개의 환경으로 진행될때
  beforeEach("should deploy", async () => {
    signers = await hre.ethers.getSigners();
    myTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      18,
      100,
    ]);
  });

  describe("Basic state value check", async () => {
    it("should return name", async () => {
      expect(await myTokenC.name()).equal("MyToken");
    });
    it("should return symbol", async () => {
      expect(await myTokenC.symbol()).equal("MT");
    });
    it("should return decimals", async () => {
      expect(await myTokenC.decimals()).equal(18);
    });

    it("should return 100 totalSupply", async () => {
      expect(await myTokenC.totalSupply()).equal(
        mintingAmount * 10n ** decimal
      );
    });
  });

  // 1MT = 1*10^18
  describe("Mint", () => {
    it("should return 1MT balance for signer 0", async () => {
      const signer0 = signers[0];
      expect(await myTokenC.balanceOf(signer0)).equal(
        mintingAmount * 10n ** decimal
      );
    });
  });

  describe("Transfer", () => {
    // 트랜잭션
    it("should have 0.5MT", async () => {
      const signer1 = signers[1];
      const tx = await myTokenC.transfer(
        hre.ethers.parseUnits("0.5", decimal),
        signer1.address
      );
      const receipt = await tx.wait();
      console.log(receipt?.logs);
      expect(await myTokenC.balanceOf(signer1)).equal(
        hre.ethers.parseUnits("0.5", decimal)
      );
    });

    it("should be reverted with insufficient balance error", async () => {
      const signer1 = signers[1];
      // await이 코드 실행 끝까지 기다리기 때문에 오류 발생 후 테스트 x
      // expect(
      //   await myTokenC.transfer(hre.ethers.parseUnits("1.1", decimal), signer1.address)
      // ).to.be.revertedWith("insufficient balance");

      // 예외상황을 테스트 하는거기 때문에
      // await의 위치를 expect 바깥으로 바꿔줌으로 해결
      await expect(
        myTokenC.transfer(
          hre.ethers.parseUnits((mintingAmount + 1n).toString(), decimal),
          signer1.address
        )
      ).to.be.revertedWith("insufficient balance");
    });
  });
});
