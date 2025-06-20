export async function uploadToIPFS(data: any) {
  const res = await fetch("https://ipfs.io/api/v0/add?pin=true", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  return result.Hash || result.cid || "";
}
