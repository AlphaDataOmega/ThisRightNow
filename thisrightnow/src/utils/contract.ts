import { ethers } from "ethers";

export function loadContract<T extends ethers.Contract>(
  address: string,
  abi: any,
  signerOrProvider: ethers.Signer | ethers.Provider
): T {
  return new ethers.Contract(address, abi, signerOrProvider) as T;
}
