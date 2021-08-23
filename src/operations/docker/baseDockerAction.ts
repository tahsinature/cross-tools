import asyncLoader from '@app/util/asyncLoader';
import Docker from 'dockerode';
import colors from 'colors';

export abstract class BaseDockerAction {
  abstract cmd: string;
  abstract handle(): Promise<any>;
  docker!: Docker;
  asyncLoader = asyncLoader;
  colors = colors;

  constructor() {}

  init(docker: Docker) {
    this.docker = docker;
  }
}
