import { IAria2ClientOptions } from 'libaria2-ts/dist/adapter';

export type Config = {
  packages: {
    url?: string;
    id?: string;
    dir: string;
    ring?: string;
    lang?: string;
  }[];
  basedir: string,
  downloaddir?: string,
  aria2: IAria2ClientOptions
}

export type Package = {
  name: string;
  url: string;
}
