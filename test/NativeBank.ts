import hre from "hardhat";
import { NativeBank } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { DECIMAL } from "./constant";

describe("NativeBBank", () => {
  let signers: HardhatEthersSigner[];
  let nativeBankC: NativeBank;

  beforeEach("Deplot NativeBank contract", async () => {
    signers = await hre.ethers.getSigners();
    nativeBankC = await hre.ethers.deployContract("NativeBank");
  });
  it("Should send native token to contract", async () => {
    const staker = signers[0];

    const tx = {
      from: staker.address,
      to: await nativeBankC.getAddress(),
      value: hre.ethers.parseEther("1"),
    };
    const txResp = await staker.sendTransaction(tx);
    const txRecipt = await txResp.wait();
    console.log(
      await hre.ethers.provider.getBalance(await nativeBankC.getAddress())
    );
    console.log(await nativeBankC.balanceOf(staker.address));
  });

  it("Should withdraw all the tokens", async () => {
    const staker = signers[0];
    const stakingAmount = hre.ethers.parseEther("10");
    const tx = {
      from: staker,
      to: await nativeBankC.getAddress(),
      value: stakingAmount,
    };
    const sendTx = await staker.sendTransaction(tx);
    sendTx.wait();
    expect(await nativeBankC.balanceOf(staker.address)).equal(stakingAmount);

    await nativeBankC.withdraw();
    expect(await nativeBankC.balanceOf(staker.address)).equal(0n);
  });

  const unitParser = (amount: string) => hre.ethers.parseUnits(amount, DECIMAL);
  const unitFormatter = (amount: bigint) =>
    hre.ethers.formatUnits(amount, DECIMAL);
  const getBalance = async (address: string) =>
    unitFormatter(await hre.ethers.provider.getBalance(address));

  it("exploit", async () => {
    const victim1 = signers[1];
    const victim2 = signers[2];
    const hacker = signers[3];
    // hacker가 Exploit을 배포
    const exploitC = await hre.ethers.deployContract(
      "Exploit",
      [await nativeBankC.getAddress()],
      hacker
    );
    const hCAddr = await exploitC.getAddress();
    const statkingAmount = unitParser("1");

    const v1Tx = {
      from: victim1.getAddress(),
      to: await nativeBankC.getAddress(),
      value: statkingAmount,
    };

    const v2Tx = {
      from: victim2.getAddress(),
      to: await nativeBankC.getAddress(),
      value: statkingAmount,
    };
    await victim1.sendTransaction(v1Tx);
    await victim2.sendTransaction(v2Tx);
    // 아래와 같이 탈취를 한다면 exploitC 인스턴스에만 토큰이 쌓이므로 hacker에게 전송하는 로직을 따로 작성해야함.
    console.log(await getBalance(hCAddr));
    await exploitC.exploit({ value: statkingAmount });
    console.log(await getBalance(hCAddr));
  });
});
