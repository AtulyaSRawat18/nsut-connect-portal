export default function CampusLineArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 330"
      className={`h-auto w-full text-[#17345f] ${className}`}
      role="img"
      aria-label="Line illustration of a university research campus"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 285 C170 245 280 260 385 285 C510 314 690 305 820 276 C970 243 1085 251 1170 286" strokeWidth="3" opacity=".45" />
        <path d="M155 252V132h282v120M437 252V82h166v170M603 252V116h309v136M912 252V157h138v95" strokeWidth="5" />
        <path d="M188 132V103h215v29M469 82V55h102v27M640 116V91h235v25" strokeWidth="4" />
        <path d="M170 252h265M455 252h151M622 252h293M929 252h122" strokeWidth="8" />
        <path d="M195 155h215M195 184h215M195 213h215M462 112h132M462 148h132M462 184h132M633 143h270M633 177h270M633 211h270" strokeWidth="2.5" opacity=".8" />
        <path d="M236 132v120M292 132v120M348 132v120M505 82v170M553 82v170M681 116v136M737 116v136M793 116v136M849 116v136M963 157v95M1009 157v95" strokeWidth="2" opacity=".62" />
        <path d="M476 252v-48h36v48M545 252v-48h36v48M733 252v-51h49v51" strokeWidth="3.5" />
        <ellipse cx="584" cy="285" rx="118" ry="25" strokeWidth="4" />
        <ellipse cx="584" cy="277" rx="72" ry="15" strokeWidth="2.5" />
        <path d="M584 276V220M566 244c12 8 24 8 36 0M574 230c7 5 14 5 21 0" strokeWidth="3" />
        <path d="M555 279c8-21 18-33 29-37c11 4 21 16 29 37" strokeWidth="2" opacity=".7" />
        <path d="M58 285c8-43 22-67 42-72c20 5 34 29 42 72M92 285v-64M73 242l19 12l22-17M1032 284c7-48 22-74 44-80c22 6 37 32 44 80M1076 284v-70M1051 238l25 16l26-21" strokeWidth="4" />
        <path d="M4 306h1192" strokeWidth="4" />
      </g>
      <g fill="#d6222a" opacity=".86">
        <rect x="212" y="146" width="7" height="9" rx="1" /><rect x="268" y="175" width="7" height="9" rx="1" />
        <rect x="326" y="205" width="7" height="9" rx="1" /><rect x="481" y="123" width="7" height="9" rx="1" />
        <rect x="529" y="159" width="7" height="9" rx="1" /><rect x="657" y="154" width="7" height="9" rx="1" />
        <rect x="765" y="188" width="7" height="9" rx="1" /><rect x="865" y="220" width="7" height="9" rx="1" />
      </g>
    </svg>
  );
}
