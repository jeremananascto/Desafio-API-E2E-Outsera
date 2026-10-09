import type { Server } from 'node:http';

export function start(port: number): Promise<Server>;