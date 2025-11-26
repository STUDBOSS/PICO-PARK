# Oracle Cloud Deployment Guide

## Prerequisites

1. **Oracle Cloud Account**
   - Free tier available at oracle.com/cloud/free
   - Credit card required for verification

2. **Local Development**
   - Docker installed
   - Project tested with `npm start` locally
   - All code committed to git

3. **Tools**
   - Oracle Cloud CLI (oci) - optional but recommended
   - Docker CLI
   - git

## Step 1: Prepare Docker Image

### Build Locally
```bash
# Navigate to project directory
cd "d:\Mohit\VS Code\PICO Park"

# Build Docker image
docker build -t pico-park:latest .

# Test locally
docker run -p 3000:3000 pico-park:latest

# Access at http://localhost:3000
```

### Tag Image for Registry
```bash
# You'll need your Oracle Registry URL
# Format: <region>.ocir.io/<namespace>/<repo>/pico-park:latest

# Example:
docker tag pico-park:latest iad.ocir.io/mycompany/pico-park:latest
```

## Step 2: Set Up Oracle Container Registry

### Via Oracle Cloud Console

1. **Log in** to oracle.com/cloud
2. **Navigate** to Container Registry
3. **Create Repository**
   - Name: `pico-park`
   - Visibility: Private or Public
4. **Generate Auth Token**
   - Profile → Auth Tokens
   - Generate New Token
   - Copy token value

### Via CLI
```bash
# Create repository
oci registry container-repository create \
  --compartment-id <compartment-ocid> \
  --display-name pico-park \
  --is-public false
```

## Step 3: Push Image to Registry

### Authenticate Docker
```bash
# Linux/Mac
docker login <region>.ocir.io

# When prompted:
# Username: <namespace>/<username>
# Password: <auth-token-from-step-2>

# Windows PowerShell
$token = "<your-auth-token>"
$username = "<namespace>/<username>"
docker login -u $username -p $token iad.ocir.io
```

### Push Image
```bash
docker push iad.ocir.io/<namespace>/pico-park:latest
```

**Note:** Replace `iad` with your region:
- `iad` = US East (Ashburn)
- `phx` = US Phoenix
- `lhr` = London
- `nrt` = Tokyo

## Step 4: Deploy to Container Instance

### Via Oracle Cloud Console

1. **Navigate** to Container Instances
2. **Create Instance**
   - Name: `pico-park-game`
   - Compartment: Select your compartment
   - Image: Select from registry
     - Registry: Oracle Cloud Container Registry
     - Image: `pico-park:latest`
   - Shape: Ampere (ARM) - free tier eligible
   - Networking:
     - Virtual Cloud Network: Create or select
     - Subnet: Create or select
     - Public IP: Assign

3. **Configuration**
   - Container port: 3000
   - Environment variables:
     ```
     NODE_ENV=production
     PORT=3000
     ```

4. **Security Group Rules**
   - Allow Ingress: Protocol TCP, Port 3000, Source 0.0.0.0/0

5. **Click Create**

### Via CLI
```bash
# Create container instance
oci container-instances container-instance create \
  --compartment-id <compartment-ocid> \
  --display-name pico-park-game \
  --containers '[{
    "display_name": "pico-park",
    "image_uri": "iad.ocir.io/<namespace>/pico-park:latest",
    "working_directory": "/app"
  }]' \
  --shape AMPERE \
  --shape-config '{"memory_in_gbs": 1, "ocpus": 1}'
```

## Step 5: Configure Networking

### Security List (Firewall Rules)
1. **Navigate** to Virtual Cloud Networks
2. **Select** your VCN
3. **Select** Security List
4. **Add Ingress Rule**
   - Stateless: No
   - Protocol: TCP
   - Source: 0.0.0.0/0
   - Destination Port Range: 3000
   - Action: Allow

### Load Balancer (Optional)
For production with multiple instances:
1. Create Network Load Balancer
2. Configure backend set (port 3000)
3. Add multiple container instances as backends

## Step 6: Access the Game

### Get Public IP
```bash
# Via Console: Compute → Container Instances → pico-park-game
# Copy the Public IP address

# Via CLI
oci container-instances container-instance list \
  --compartment-id <compartment-ocid> \
  --query 'data[0]."vnics"[0]."public-ip"'
```

### Access URL
```
http://<public-ip>:3000
```

### Test Multiplayer
1. Player 1: Open `http://<public-ip>:3000`
2. Player 2: Open `http://<public-ip>:3000` from different device
3. Both join same room (e.g., "room1")
4. Start playing!

## Step 7: Monitor and Manage

### View Logs
```bash
# Container logs via CLI
oci container-instances container get-logs \
  --container-instance-id <instance-ocid> \
  --container-name pico-park
```

### Monitor Performance
1. **Console** → Monitoring
2. View CPU, Memory, Network metrics
3. Set up alarms for high usage

### Update Container
```bash
# Make code changes
# Build new image
docker build -t pico-park:v2 .

# Push new image
docker tag pico-park:v2 iad.ocir.io/<namespace>/pico-park:v2
docker push iad.ocir.io/<namespace>/pico-park:v2

# Update container instance (via console or recreate)
```

## Scaling Strategy

### Horizontal Scaling
For multiple rooms with different servers:

```bash
# Create second container instance
oci container-instances container-instance create \
  --compartment-id <compartment-ocid> \
  --display-name pico-park-game-2 \
  # ... same config as above

# Use load balancer to distribute traffic
```

### Vertical Scaling
Increase resource allocation:
```bash
# Stop current instance
# Create new instance with larger shape (e.g., STANDARD_A1)
# Increase memory in shape config
```

## Cost Optimization

### Free Tier Usage
- Container Instances: Up to 2 instances (1 OCPU, 1GB RAM each)
- Registry Storage: 10GB included
- Data transfer: First 10GB/month free

### Cost Reduction
1. Use ARM-based shapes (Ampere)
2. Stop instances when not in use
3. Use smaller memory allocations
4. Consolidate multiple games per instance (different rooms)
5. Use spot instances (if available)

## Troubleshooting

### Container Won't Start
```bash
# Check logs
oci container-instances container get-logs \
  --container-instance-id <id> \
  --container-name pico-park | head -50

# Verify image exists in registry
oci registry container-image list \
  --repository-name pico-park
```

### Can't Connect from Browser
1. Verify security group allows port 3000
2. Check if instance has public IP assigned
3. Confirm container is running
4. Test locally first: `docker run -p 3000:3000 pico-park:latest`

### High Latency
1. Deploy in region closest to players
2. Check network configuration
3. Consider adding more resources
4. Enable latency compensation on client

### Players Can't Sync
```
Server logs should show:
✓ Players connecting
✓ Game state updates at 60 Hz
✓ Collision detection working
```

## Production Checklist

- [ ] Code tested locally with `npm start`
- [ ] Docker image builds successfully
- [ ] Image runs locally: `docker run -p 3000:3000 pico-park:latest`
- [ ] Image pushed to Oracle Registry
- [ ] Container instance created
- [ ] Security group allows port 3000
- [ ] Public IP assigned and accessible
- [ ] Game accessible at `http://<ip>:3000`
- [ ] Multiple players can connect and play
- [ ] No errors in container logs
- [ ] Health check passing (container stays running)
- [ ] DNS record created (optional, for custom domain)

## Advanced: Auto-Scaling

### Using Functions (Serverless)
1. **Create Oracle Function** to handle game requests
2. **Trigger** based on load
3. **Scale automatically** up to 6 players per function

### Using Kubernetes (OKE)
1. **Create OKE Cluster**
2. **Deploy** pico-park as Kubernetes Deployment
3. **Enable autoscaling** based on CPU/Memory
4. **Use StatefulSets** for persistent game state

## Database Integration (Future)

For leaderboards and player stats:

### Set Up Autonomous Database
```bash
oci db autonomous-database create \
  --compartment-id <compartment-ocid> \
  --display-name pico-park-db \
  --db-name picopark
```

### Update Server Connection
```javascript
// In server.js
const db = require('oracledb');
db.createPool({
  user: 'admin',
  password: '<password>',
  connectString: '<connection-string>',
  poolMin: 1,
  poolMax: 5
});
```

## Support and Resources

### Oracle Cloud Documentation
- [Container Instances](https://docs.oracle.com/en-us/iaas/container-instances/)
- [Container Registry](https://docs.oracle.com/en-us/iaas/container-registry/)
- [VCN and Networking](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/overview.htm)

### Useful Commands
```bash
# List regions
oci iam region list

# List shapes (instance types)
oci compute shape list --compartment-id <id>

# Monitor container
watch -n 5 'docker stats'

# View network info
docker inspect <container-id> | grep -A 4 '"Networks"'
```

## Final Notes

1. **HTTPS/TLS**: Configure at load balancer or proxy
2. **Custom Domain**: Use DNS provider to point to public IP
3. **Backups**: Container is stateless (no backup needed)
4. **Disaster Recovery**: Redeploy image to new instance
5. **CDN**: Optionally serve static assets via CDN

---

**Deployment Guide Version: 1.0**  
**Oracle Cloud Region Support: All regions with Container Instances**
