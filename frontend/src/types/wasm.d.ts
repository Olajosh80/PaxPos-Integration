// Type declarations for WASM modules

declare module '/wasm/stripe_terminal_wasm.js' {
  export default function init(): Promise<void>;
  export class StripeTerminal {
    constructor();
    is_hardware_available(): boolean;
    get_terminal_info(): Promise<any>;
    start_card_reading(callback: (data: any) => void): Promise<void>;
    stop_card_reading(): void;
    print_receipt(text: string): Promise<boolean>;
    beep(duration: number): void;
    vibrate(duration: number): void;
    format_card_number(pan: string): string;
    mask_card_number(pan: string): string;
  }
}

declare module '*.wasm' {
  const content: string;
  export default content;
}

declare module '*.wasm?url' {
  const content: string;
  export default content;
}
