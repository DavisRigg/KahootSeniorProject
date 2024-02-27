import { io } from 'socket.io-client';
import configuration from './configuration';

export const socket = io(`http://${configuration.ip_address}:4000`);
