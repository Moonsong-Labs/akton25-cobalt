interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, callback: (params: any) => void): void;
  removeListener(event: string, callback: (params: any) => void): void;
}

interface Window {
  ethereum?: EthereumProvider;
}
