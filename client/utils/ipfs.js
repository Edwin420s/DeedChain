import { Web3Storage } from 'web3.storage'

const client = new Web3Storage({ 
  token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN 
})

export const uploadToIPFS = async (files) => {
  try {
    const cid = await client.put(files)
    return cid
  } catch (error) {
    console.error('IPFS upload error:', error)
    throw new Error('Failed to upload to IPFS')
  }
}

export const getIPFSUrl = (cid) => {
  return `https://${cid}.ipfs.dweb.link/`
}