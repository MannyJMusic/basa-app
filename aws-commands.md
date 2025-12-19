export TARGET=i-0212f9e92f4e613a2
export VOL=vol-05fdea4d16dd6aa2e
export HELPER=i-07d3d320051c5938c

aws ec2 stop-instances --instance-ids "$TARGET"
aws ec2 wait instance-stopped --instance-ids "$TARGET"

# Get the exact root device name (e.g., /dev/xvda or /dev/sda1)
aws ec2 describe-instances --instance-ids "$TARGET" \
  --query "Reservations[0].Instances[0].RootDeviceName" --output text
export ROOT_DEVICE=/dev/xvda   # set to the value returned above