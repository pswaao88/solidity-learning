import hre from "hardhat";
import { expect } from "chai";
import { MyToken } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { DECIMAL, MINTING_AMOUNT } from "./constant";

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
      DECIMAL,
      MINTING_AMOUNT,
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
        MINTING_AMOUNT * 10n ** DECIMAL
      );
    });
  });

  // 1MT = 1*10^18
  describe("Mint", () => {
    it("should return 1MT balance for signer 0", async () => {
      const signer0 = signers[0];
      expect(await myTokenC.balanceOf(signer0)).equal(
        MINTING_AMOUNT * 10n ** DECIMAL
      );
    });

    it("should return or revert when minting infinitly", async () => {
      const hacker = signers[2];
      const mintingAgainAmount = hre.ethers.parseUnits("10000", DECIMAL);
      await expect(
        myTokenC.connect(hacker).mint(mintingAgainAmount, hacker.address)
      ).to.be.revertedWith("You are not authorized to manage this contract");
    });
  });

  describe("Transfer", () => {
    // 트랜잭션
    it("should have 0.5MT", async () => {
      const signer0 = signers[0];
      const signer1 = signers[1];
      await expect(
        myTokenC.transfer(
          hre.ethers.parseUnits("0.5", DECIMAL),
          signer1.address
        )
      )
        .to.emit(myTokenC, "Transfer")
        .withArgs(
          signer0.address,
          signer1.address,
          hre.ethers.parseUnits("0.5", DECIMAL)
        );
      expect(await myTokenC.balanceOf(signer1)).equal(
        hre.ethers.parseUnits("0.5", DECIMAL)
      );

      // const filter = myTokenC.filters.Transfer(signer0.address);
      // // 리소스를 많이 잡아먹음
      // // 하지만 테스트 환경에서는 적음
      // const logs = await myTokenC.queryFilter(filter, 0, "latest");
      // // myTokenC.queryFilter(filter, latest - 10, "latest"); // 리소스를 많이 잡아먹으르모 범위 제한
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
          hre.ethers.parseUnits((MINTING_AMOUNT + 1n).toString(), DECIMAL),
          signer1.address
        )
      ).to.be.revertedWith("insufficient balance");
    });
  });
  describe("TransferFrom", () => {
    it("should emit Approval event", async () => {
      const signer1 = signers[1];
      await expect(
        myTokenC.approve(signer1, hre.ethers.parseUnits("10", DECIMAL))
      )
        .to.emit(myTokenC, "Approval")
        .withArgs(signer1.address, hre.ethers.parseUnits("10", DECIMAL));
    });

    it("should be reverted with insufficient allowance error", async () => {
      const signer0 = signers[0];
      const signer1 = signers[1];
      await expect(
        myTokenC
          .connect(signer1)
          .transferFrom(
            signer0.address,
            signer1.address,
            hre.ethers.parseUnits("1", DECIMAL)
          )
      ).to.be.revertedWith("insufficient allowance");
    });
    // 단순하게 equal로 비교
    it("should move signer0 to signer1 by signer1", async () => {
      const signer0 = signers[0];
      const signer1 = signers[1];
      // connect를 통해 signer0가 트랜잭션을 만들게된다.
      // signer0가 msg.sender가 되므로
      // approve 메소드를 이용해 signer1에게 해당되는 개수 만큼 허용을 해준다.
      await myTokenC
        .connect(signer0)
        .approve(signer1, hre.ethers.parseUnits("20", DECIMAL));
      // signer0 에서 singer1으로 10개를 보낸다.
      await myTokenC
        .connect(signer1)
        .transferFrom(signer0, signer1, hre.ethers.parseUnits("10", DECIMAL));
      // await으로 처리를 기다린 후에 equal을 해야 정상적으로 작동
      expect(await myTokenC.balanceOf(signer1)).equal(
        hre.ethers.parseUnits("10", DECIMAL) // signer1의 잔액이 10MT인지 확인
      );
    });
  });
});
