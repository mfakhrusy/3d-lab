import { createSignal, onMount, onCleanup } from "solid-js";

const MOBILE_BREAKPOINT = 768;

export function useMobile() {
  const [isMobile, setIsMobile] = createSignal(false);

  onMount(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    onCleanup(() => {
      window.removeEventListener("resize", checkMobile);
    });
  });

  return isMobile;
}
