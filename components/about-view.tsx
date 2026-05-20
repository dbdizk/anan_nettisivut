import Image from "next/image";

export function AboutView() {
  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      <div className="h-full w-full p-[18px] flex items-center">
        <div className="w-full px-0 md:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-14">
            <div className="w-full md:w-[420px] lg:w-[520px] shrink-0">
              <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg border border-gray-800">
                <Image
                  src="/images/nettisivu%20pf%20kuva.png"
                  alt="Portrait"
                  fill
                  sizes="(min-width: 1024px) 520px, (min-width: 768px) 420px, 90vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-none md:mt-[-10px]">
                ABOUT ME
              </h2>
              <div className="mt-6 max-w-[70ch] text-lg md:text-xl text-gray-300 leading-relaxed space-y-6">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, urna eu tincidunt
                  consectetur, nisi nisl aliquam nunc, non blandit massa nunc at lorem. Integer vitae justo
                  quis nulla facilisis dignissim.
                </p>
                <p className="hidden md:block">
                  Aenean sit amet justo a arcu dignissim tincidunt. Morbi id sapien nec nunc varius
                  ullamcorper. Donec sed ligula ut arcu viverra euismod. Pellentesque habitant morbi
                  tristique senectus et netus et malesuada fames ac turpis egestas.
                </p>
                <p className="hidden md:block">
                  Curabitur consequat, libero non consequat laoreet, arcu lorem interdum nulla, sed
                  pellentesque mi tortor at lacus. Praesent in mi at lacus finibus laoreet. Vestibulum
                  ullamcorper, velit vel tempor volutpat, justo ipsum pretium justo, sed interdum dolor
                  lorem in lorem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
