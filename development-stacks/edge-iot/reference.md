# Edge & IoT Reference

Detailed reference for edge computing and IoT development.

## Communication Protocols

### MQTT (Message Queuing Telemetry Transport)

Lightweight publish/subscribe protocol for IoT.

| Property | Description |
|----------|-------------|
| Port | 1883 (TCP), 8883 (TLS) |
| QoS Levels | 0 (at most once), 1 (at least once), 2 (exactly once) |
| Payload | Binary, typically JSON or Protocol Buffers |
| Keep-alive | Heartbeat to maintain connection |

```javascript
// MQTT Client Example (Node.js)
const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://broker.example.com', {
  clientId: 'device_001',
  username: 'user',
  password: 'pass',
  keepalive: 60,
  clean: true,
});

// Subscribe
client.subscribe('sensors/+/temperature', { qos: 1 });

// Publish
client.publish('sensors/device_001/temperature', JSON.stringify({
  value: 23.5,
  unit: 'celsius',
  timestamp: Date.now(),
}), { qos: 1, retain: true });

// Handle messages
client.on('message', (topic, payload) => {
  const data = JSON.parse(payload.toString());
  console.log(`${topic}: ${data.value}`);
});
```

### CoAP (Constrained Application Protocol)

UDP-based REST-like protocol for constrained devices.

| Property | Description |
|----------|-------------|
| Port | 5683 (UDP), 5684 (DTLS) |
| Methods | GET, POST, PUT, DELETE |
| Observe | Subscription mechanism |
| Block-wise | Large payload transfer |

```javascript
// CoAP Example
const coap = require('coap');

// GET request
const req = coap.request('coap://device.local/temperature');
req.on('response', (res) => {
  console.log(res.payload.toString());
});
req.end();

// Observable resource
const req = coap.request({
  hostname: 'device.local',
  pathname: '/temperature',
  observe: true,
});
req.on('response', (res) => {
  res.on('data', (chunk) => console.log(chunk.toString()));
});
```

### WebSocket (IoT Variant)

Full-duplex communication over TCP.

```javascript
// WebSocket for IoT
const WebSocket = require('ws');

const ws = new WebSocket('wss://iot-gateway.example.com');

ws.on('open', () => {
  // Register device
  ws.send(JSON.stringify({
    type: 'register',
    deviceId: 'device_001',
    capabilities: ['temperature', 'humidity'],
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  if (msg.type === 'command') {
    executeCommand(msg.payload);
  }
});
```

## Data Formats

### Sensor Data Schema

```typescript
interface SensorReading {
  deviceId: string;
  sensorType: string;
  value: number | string | boolean;
  unit?: string;
  timestamp: number; // Unix epoch ms
  quality?: 'good' | 'uncertain' | 'bad';
  metadata?: Record<string, unknown>;
}

interface DeviceTelemetry {
  deviceId: string;
  readings: SensorReading[];
  battery?: number; // percentage
  signal?: number; // dBm
  firmware?: string;
  uptime?: number; // seconds
}
```

### Protocol Buffers (Efficient Binary)

```protobuf
// sensor.proto
syntax = "proto3";

message SensorReading {
  string device_id = 1;
  string sensor_type = 2;
  double value = 3;
  string unit = 4;
  int64 timestamp = 5;
  Quality quality = 6;

  enum Quality {
    GOOD = 0;
    UNCERTAIN = 1;
    BAD = 2;
  }
}

message TelemetryBatch {
  repeated SensorReading readings = 1;
  int32 battery_percent = 2;
  int32 signal_dbm = 3;
}
```

## Edge Processing Patterns

### Local Aggregation

```python
# Edge aggregation before cloud upload
class SensorAggregator:
    def __init__(self, window_size=60):  # 60 seconds
        self.window_size = window_size
        self.readings = []

    def add_reading(self, value, timestamp):
        self.readings.append({'value': value, 'ts': timestamp})
        self._prune_old_readings(timestamp)

    def get_aggregated(self):
        if not self.readings:
            return None

        values = [r['value'] for r in self.readings]
        return {
            'min': min(values),
            'max': max(values),
            'avg': sum(values) / len(values),
            'count': len(values),
            'window_start': self.readings[0]['ts'],
            'window_end': self.readings[-1]['ts'],
        }

    def _prune_old_readings(self, current_time):
        cutoff = current_time - (self.window_size * 1000)
        self.readings = [r for r in self.readings if r['ts'] > cutoff]
```

### Rule Engine

```python
# Simple edge rule engine
class RuleEngine:
    def __init__(self):
        self.rules = []

    def add_rule(self, condition, action, name=None):
        self.rules.append({
            'name': name,
            'condition': condition,
            'action': action,
        })

    def evaluate(self, reading):
        triggered = []
        for rule in self.rules:
            if rule['condition'](reading):
                rule['action'](reading)
                triggered.append(rule['name'])
        return triggered

# Usage
engine = RuleEngine()

# High temperature alert
engine.add_rule(
    condition=lambda r: r['type'] == 'temperature' and r['value'] > 30,
    action=lambda r: send_alert(f"High temp: {r['value']}°C"),
    name='high_temp_alert'
)

# Motion detection
engine.add_rule(
    condition=lambda r: r['type'] == 'motion' and r['value'] == True,
    action=lambda r: activate_lights(),
    name='motion_lights'
)
```

## Device Provisioning

### Zero-Touch Provisioning

```typescript
interface DeviceProvisioningConfig {
  // Device identity
  deviceId: string;
  deviceType: string;
  serialNumber: string;

  // Network
  network: {
    wifi?: {
      ssid: string;
      password: string;
      security: 'WPA2' | 'WPA3';
    };
    ethernet?: {
      dhcp: boolean;
      staticIp?: string;
    };
  };

  // Cloud connection
  cloud: {
    endpoint: string;
    protocol: 'mqtt' | 'https' | 'coap';
    auth: {
      method: 'certificate' | 'token' | 'symmetric_key';
      certificate?: string;
      privateKey?: string;
      token?: string;
    };
  };

  // Firmware
  firmware: {
    currentVersion: string;
    updateUrl?: string;
    autoUpdate: boolean;
  };

  // Sensors configuration
  sensors: Array<{
    id: string;
    type: string;
    pin?: number;
    address?: string; // I2C/SPI address
    samplingRate: number; // ms
    calibration?: Record<string, number>;
  }>;
}
```

### Device Twin Pattern

```typescript
// Azure IoT Hub style device twin
interface DeviceTwin {
  deviceId: string;

  // Desired state (set by cloud)
  desired: {
    firmwareVersion: string;
    telemetryInterval: number;
    thresholds: {
      temperature: { min: number; max: number };
    };
    $version: number;
  };

  // Reported state (set by device)
  reported: {
    firmwareVersion: string;
    telemetryInterval: number;
    lastBootTime: string;
    connectivity: 'online' | 'offline';
    $version: number;
  };

  // Read-only metadata
  tags: {
    location: string;
    environment: string;
    owner: string;
  };
}
```

## OTA (Over-The-Air) Updates

### Update Protocol

```typescript
interface OTAUpdateManifest {
  version: string;
  releaseDate: string;
  releaseNotes: string;

  // Firmware binary
  firmware: {
    url: string;
    size: number;
    checksum: string; // SHA-256
    signature: string; // RSA signature
  };

  // Targeting
  targeting: {
    deviceTypes?: string[];
    minFirmwareVersion?: string;
    rolloutPercentage?: number;
    regions?: string[];
  };

  // Rollback
  rollback: {
    automaticRollback: boolean;
    healthCheckEndpoint?: string;
    healthCheckTimeout?: number;
  };
}

// Update state machine
type OTAState =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'verifying'
  | 'installing'
  | 'rebooting'
  | 'success'
  | 'failed'
  | 'rollback';
```

## Power Management

### Sleep Modes

| Mode | Power | Wake-up Time | Use Case |
|------|-------|--------------|----------|
| Active | 100% | - | Processing |
| Idle | 30-50% | <1ms | Waiting |
| Light Sleep | 5-10% | <10ms | Short intervals |
| Deep Sleep | <1% | 100ms-1s | Long intervals |
| Hibernate | ~0% | Seconds | Extended periods |

```c
// ESP32 Deep Sleep Example
#include "esp_sleep.h"

void enter_deep_sleep(uint64_t sleep_time_us) {
    // Configure wake-up source
    esp_sleep_enable_timer_wakeup(sleep_time_us);

    // Optional: wake on GPIO
    esp_sleep_enable_ext0_wakeup(GPIO_NUM_33, 1);

    // Enter deep sleep
    esp_deep_sleep_start();
}

// Wake up and determine cause
esp_sleep_wakeup_cause_t wakeup_reason = esp_sleep_get_wakeup_cause();
switch (wakeup_reason) {
    case ESP_SLEEP_WAKEUP_TIMER:
        // Scheduled wake
        break;
    case ESP_SLEEP_WAKEUP_EXT0:
        // GPIO interrupt
        break;
}
```

## Security Best Practices

### Device Security Checklist

```markdown
## Hardware Security
- [ ] Secure boot enabled
- [ ] Hardware security module (HSM) for key storage
- [ ] Tamper detection mechanisms
- [ ] Unique device identity (hardware root of trust)

## Firmware Security
- [ ] Signed firmware images
- [ ] Secure OTA update mechanism
- [ ] Rollback protection
- [ ] Watchdog timer enabled

## Communication Security
- [ ] TLS 1.3 for all connections
- [ ] Certificate pinning
- [ ] Mutual authentication
- [ ] Message encryption

## Data Security
- [ ] Data encryption at rest
- [ ] Minimal data collection
- [ ] Secure data deletion
- [ ] Privacy by design

## Access Control
- [ ] Principle of least privilege
- [ ] Role-based access control
- [ ] Strong authentication
- [ ] Session management
```

### Certificate Management

```typescript
interface DeviceCertificate {
  // X.509 certificate
  certificate: string; // PEM format
  privateKey: string;  // PEM format (stored securely)
  caCertificate: string;

  // Metadata
  deviceId: string;
  issuedAt: Date;
  expiresAt: Date;
  issuer: string;

  // Renewal
  renewalWindow: number; // days before expiry
  autoRenew: boolean;
}
```

## Common Hardware Interfaces

### GPIO

```python
# Raspberry Pi GPIO example
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BCM)

# Output (LED)
GPIO.setup(18, GPIO.OUT)
GPIO.output(18, GPIO.HIGH)

# Input (Button)
GPIO.setup(17, GPIO.IN, pull_up_down=GPIO.PUD_UP)
if GPIO.input(17) == GPIO.LOW:
    print("Button pressed")

# PWM
pwm = GPIO.PWM(18, 1000)  # 1kHz
pwm.start(50)  # 50% duty cycle
```

### I2C

```python
# I2C sensor reading
import smbus

bus = smbus.SMBus(1)  # I2C bus 1
address = 0x48  # Device address

# Read temperature from TMP102
data = bus.read_i2c_block_data(address, 0x00, 2)
temp = ((data[0] << 4) | (data[1] >> 4)) * 0.0625
print(f"Temperature: {temp}°C")
```

### SPI

```python
# SPI communication
import spidev

spi = spidev.SpiDev()
spi.open(0, 0)  # Bus 0, Device 0
spi.max_speed_hz = 1000000

# Transfer data
response = spi.xfer2([0x01, 0x02, 0x03])
```

## Platform-Specific References

| Platform | Documentation |
|----------|---------------|
| AWS IoT | https://docs.aws.amazon.com/iot/ |
| Azure IoT | https://docs.microsoft.com/azure/iot-hub/ |
| Google Cloud IoT | https://cloud.google.com/iot-core |
| ESP-IDF | https://docs.espressif.com/projects/esp-idf/ |
| Raspberry Pi | https://www.raspberrypi.com/documentation/ |
| Arduino | https://docs.arduino.cc/ |
| Zephyr RTOS | https://docs.zephyrproject.org/ |
| FreeRTOS | https://www.freertos.org/Documentation/ |
