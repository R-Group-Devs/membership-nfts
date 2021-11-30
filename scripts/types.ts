export interface ConstructorArguments {
  name: string;
  symbol: string;
  organization: string;
  transferable: boolean;
}

export interface Deployment {
  address: string;
  args: ConstructorArguments;
}
