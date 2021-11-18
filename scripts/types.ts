export interface ConstructorArguments {
  name: string;
  symbol: string;
  organization: string;
  owner: string;
}

export interface Deployment {
  address: string;
  args: ConstructorArguments;
}
