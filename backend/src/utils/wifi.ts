import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface WifiNetwork {
  ssid: string;
  signal: number;
  type: string;
  authentication: string;
  encryption: string;
  connected: boolean;
}

export async function getWifiNetworks(): Promise<WifiNetwork[]> {
  try {
    // Get all available networks
    const { stdout: networksOutput } = await execAsync('netsh wlan show networks mode=bssid');
    
    // Get currently connected network
    const { stdout: interfacesOutput } = await execAsync('netsh wlan show interfaces');
    
    // Parse the connected network
    const connectedMatch = interfacesOutput.match(/SSID\s+\d+\s+:\s+(.+)/);
    const connectedSSID = connectedMatch ? connectedMatch[1].trim() : null;
    
    // Parse available networks
    const networks: WifiNetwork[] = [];
    const networkBlocks = networksOutput.split(/\r?\n\r?\n/);
    
    for (const block of networkBlocks) {
      const ssidMatch = block.match(/SSID\s+\d+\s+:\s+(.+)/);
      const signalMatch = block.match(/Signal\s+:\s+(\d+)%/);
      const typeMatch = block.match(/Network type\s+:\s+(.+)/);
      const authMatch = block.match(/Authentication\s+:\s+(.+)/);
      const encryptionMatch = block.match(/Encryption\s+:\s+(.+)/);
      
      if (ssidMatch) {
        const ssid = ssidMatch[1].trim();
        if (ssid && ssid !== 'SSID') { // Filter out empty or header SSIDs
          networks.push({
            ssid,
            signal: signalMatch ? parseInt(signalMatch[1]) : 0,
            type: typeMatch ? typeMatch[1].trim() : 'Unknown',
            authentication: authMatch ? authMatch[1].trim() : 'Unknown',
            encryption: encryptionMatch ? encryptionMatch[1].trim() : 'Unknown',
            connected: ssid === connectedSSID
          });
        }
      }
    }
    
    return networks;
  } catch (error) {
    console.error('Error getting WiFi networks:', error);
    throw new Error('Failed to get WiFi networks');
  }
}

export async function getConnectedWifiInfo(): Promise<{
  ssid: string;
  signal: number;
  channel: number;
  radioType: string;
  authentication: string;
  encryption: string;
} | null> {
  try {
    const { stdout } = await execAsync('netsh wlan show interfaces');
    
    const ssidMatch = stdout.match(/SSID\s+\d+\s+:\s+(.+)/);
    const signalMatch = stdout.match(/Signal\s+:\s+(\d+)%/);
    const channelMatch = stdout.match(/Channel\s+:\s+(\d+)/);
    const radioMatch = stdout.match(/Radio type\s+:\s+(.+)/);
    const authMatch = stdout.match(/Authentication\s+:\s+(.+)/);
    const encryptionMatch = stdout.match(/Encryption\s+:\s+(.+)/);
    
    if (!ssidMatch) return null;
    
    return {
      ssid: ssidMatch[1].trim(),
      signal: signalMatch ? parseInt(signalMatch[1]) : 0,
      channel: channelMatch ? parseInt(channelMatch[1]) : 0,
      radioType: radioMatch ? radioMatch[1].trim() : 'Unknown',
      authentication: authMatch ? authMatch[1].trim() : 'Unknown',
      encryption: encryptionMatch ? encryptionMatch[1].trim() : 'Unknown'
    };
  } catch (error) {
    console.error('Error getting connected WiFi info:', error);
    throw new Error('Failed to get connected WiFi information');
  }
} 