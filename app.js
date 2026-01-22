const CONTRACT = "0xZILAVESTING_CONTRACT";
const ABI = [
  "function vestings(address) view returns (uint256 total,uint256 claimed,uint256 start,uint256 duration)",
  "function claim() payable",
  "function claimFee() view returns (uint256)"
];

let provider, signer, contract;

async function connect() {
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  contract = new ethers.Contract(CONTRACT, ABI, signer);
  loadData();
}

async function loadData() {
  const user = await signer.getAddress();
  const v = await contract.vestings(user);

  document.getElementById("total").innerText =
    ethers.utils.formatEther(v.total);

  document.getElementById("claimed").innerText =
    ethers.utils.formatEther(v.claimed);

  const elapsed = Math.min(
    Date.now() / 1000 - v.start,
    v.duration
  );

  const vested = v.total.mul(elapsed).div(v.duration);
  const claimable = vested.sub(v.claimed);

  document.getElementById("claimable").innerText =
    ethers.utils.formatEther(claimable);
}

async function claim() {
  const fee = await contract.claimFee();
  const tx = await contract.claim({ value: fee });
  await tx.wait();
  document.getElementById("status").innerText = "✅ Claim success";
  loadData();
}
