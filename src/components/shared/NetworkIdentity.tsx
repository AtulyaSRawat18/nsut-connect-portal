import Image from "next/image";

export default function NetworkIdentity() {
  return <>
    <Image src="/nsut-research-network-logo.png" alt="" width={52} height={52} className="network-logo" />
    <span className="network-wordmark"><span>NSUT</span><strong>Research Network</strong></span>
  </>;
}
