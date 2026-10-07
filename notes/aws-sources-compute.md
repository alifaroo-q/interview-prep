# AWS compute facts from primary docs

Date checked: 2026-10-07. All pages fetched on that date from docs.aws.amazon.com or aws.amazon.com.
Format: fact. URL. "exact quote".

## 1. Global infrastructure and shared responsibility

- A Region is a physical location where AWS clusters data centers. https://aws.amazon.com/about-aws/global-infrastructure/regions_az/ "AWS has the concept of a Region, which is a physical location around the world where we cluster data centers."
- Each group of logical data centers is an Availability Zone (AZ). Same URL. "We call each group of logical data centers an Availability Zone."
- An AZ is one or more discrete data centers with redundant power, networking and connectivity. Same URL. "An Availability Zone (AZ) is one or more discrete data centers with redundant power, networking, and connectivity in an AWS Region."
- Same definition in the fault isolation whitepaper, with distance. https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/availability-zones.html "An Availability Zone is one or more discrete data centers with separate and redundant power infrastructure, networking, and connectivity in an AWS Region."
- Same whitepaper: AZs in a Region are far apart (up to 60 miles) to avoid correlated failure. Same URL. "Availability Zones in a Region are meaningfully distant from each other, up to 60 miles (~100 km)"
- Each Region has at least three AZs. https://aws.amazon.com/about-aws/global-infrastructure/regions_az/ "Each AWS Region consists of a minimum of three, isolated, and physically separate AZs within a geographic area."
- Count: 39 Regions and 124 AZs, with 7 more AZs and 2 more Regions announced (Saudi Arabia, Chile). https://aws.amazon.com/about-aws/global-infrastructure/ "The AWS Cloud spans 124 Availability Zones within 39 Geographic Regions, with announced plans for 7 more Availability Zones and 2 more AWS Regions in the Kingdom of Saudi Arabia, and Chile."
- Edge: 750+ CloudFront POPs and 15 Regional edge caches (same page). https://aws.amazon.com/about-aws/global-infrastructure/ "124 CloudFront POPs and 15 Regional edge caches 750+" (page text order is label then number: the 750+ goes with CloudFront POPs).
- CloudFront page gives the same POP count and adds embedded POPs in ISP networks. https://aws.amazon.com/cloudfront/features/ "CloudFront has 750+ POPs in 100+ cities across 50+ countries." and "there are 1,140+ embedded POPs across 300+ cities"
- CloudFront has 15 Regional Edge Caches, placed in AWS Regions. https://aws.amazon.com/cloudfront/features/ "CloudFront has 15 RECs globally."
- An EC2 AZ code is the Region code plus a letter. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html "The code for an Availability Zone is its Region code followed by a letter identifier. For example, us-east-1a."
- Regions are isolated from each other. Same URL. "Each Region is designed to be isolated from the other Regions."
- Shared responsibility, AWS side. https://aws.amazon.com/compliance/shared-responsibility-model/ "AWS is responsible for protecting the infrastructure that runs all of the services offered in the AWS Cloud."
- Shared responsibility, customer side. Same URL. "Customer responsibility will be determined by the AWS Cloud services that a customer selects."
- The two labels used by AWS. Same URL. "Security of the Cloud" (AWS) and "Security in the Cloud" (customer).

## 2. EC2

- An instance is a virtual server. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html "An EC2 instance is a virtual server in the AWS Cloud."
- Instance type decides the hardware. Same URL. "the instance type that you specify determines the hardware available to your instance."
- Naming: series, generation, options, then size after the dot. https://docs.aws.amazon.com/ec2/latest/instancetypes/instance-type-names.html "The first position of the instance family indicates the series, for example c. The second position indicates the generation, for example 7. The third position indicates the options, for example gn."
- Size follows the period. Same URL. "After the period (.) is the instance size, such as small or 4xlarge, or metal for bare metal instances."
- Option letter g = Graviton, a = AMD, i = Intel, d = instance store, n = network optimized. Same URL. "g – AWS Graviton processors", "d – Instance store volumes". So m7g.large = M series, generation 7, Graviton, size large (this reading is from the table; the page gives no m7g.large example).
- Series letters: M general purpose, C compute, R memory, I storage, T burstable, P/G GPU. Same URL. "M – General purpose", "C – Compute optimized", "R – Memory optimized", "I – Storage optimized"
- Categories: general purpose "balance of compute, memory, and networking resources". https://docs.aws.amazon.com/ec2/latest/instancetypes/ec2-instance-type-specifications.html "General purpose – Provide a balance of compute, memory, and networking resources."
- Compute optimized. Same URL. "Compute optimized – Designed for compute intensive applications that benefit from high performance processors."
- Memory optimized. Same URL. "Memory optimized – Designed to deliver fast performance for workloads that process large data sets in memory."
- Storage optimized. Same URL. "Storage optimized – Designed for workloads that require high, sequential read and write access to very large data sets on local storage."
- Accelerated computing. Same URL. "Accelerated computing – Use hardware accelerators, or co-processors, to perform functions"
- EC2 hypervisors: Xen and Nitro. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html "Amazon EC2 supports the following hypervisors: Xen and Nitro."
- Nitro hypervisor is lightweight. https://docs.aws.amazon.com/ec2/latest/instancetypes/ec2-nitro-instances.html "Nitro hypervisor - A lightweight hypervisor that manages memory and CPU allocation and delivers performance that is indistinguishable from bare metal for most workloads."
- Nitro System = dedicated hardware + hypervisor. https://aws.amazon.com/ec2/nitro/ "A combination of dedicated hardware and lightweight hypervisor enabling faster innovation and enhanced security"
- AMI. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html "An Amazon Machine Image (AMI) is an image that provides the software that is required to set up and boot an Amazon EC2 instance."
- An AMI is tied to a Region, OS, architecture. Same URL. "An AMI is specific to the following: Region Operating system Processor architecture Root volume type Virtualization type"
- User data runs setup tasks at launch. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html "you can pass user data to the instance that is used to perform automated configuration tasks, or to run scripts"
- Linux user data types. Same URL. "On Linux instances, you can pass two types of user data to Amazon EC2: shell scripts and cloud-init directives."
- IMDSv2 uses a session token (1 second to 6 hours). https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html "you create a session token that defines the session duration, which can be a minimum of one second and a maximum of six hours."
- IMDS address and token flow. Same URL. `TOKEN=`curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"``, then `curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/`
- IMDS IPv6 address. Same URL. "[fd00:ec2::254]"
- Hop limit default is 1 for the PUT response (blocks containers one hop away; raise it for container setups). Same URL. "By default, the response to PUT requests has a response hop limit (time to live) of 1 at the IP protocol level."
- Instance states and billing: pending (not billed), running (billed), stopping (not billed), stopped (not billed), shutting-down, terminated. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html "pending The instance is preparing to enter the running state. ... Not billed running The instance is running and ready for use. Billed"
- Stopped and terminated. Same URL. "stopped The instance is shut down and cannot be used. The instance can be started at any time. Not billed" and "terminated The instance has been permanently deleted and cannot be started."
- Hibernate bills in the stopping state. Same URL. "If you hibernate an instance, you're billed while the instance is in the stopping state."
- Hibernate saves RAM to the EBS root volume. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Hibernate.html "Hibernation saves the contents from the instance memory (RAM) to your Amazon Elastic Block Store (Amazon EBS) root volume."
- Hibernate must be enabled at launch. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/hibernating-prerequisites.html "You can't enable hibernation on an existing instance, whether it is running or stopped."
- Billing is per second, 60 s minimum, all purchase options. https://aws.amazon.com/ec2/pricing/ "Amazon EC2 usage is billed in one-second increments, with a minimum of 60 seconds." and "Per-second billing applies to all purchase options."
- Per-second billing applies to Amazon Linux, Windows, RHEL, Ubuntu. Same URL. "Amazon Linux Windows Red Hat Enterprise Linux Ubuntu Ubuntu Pro"
- On-Demand: pay by the second, no commitment. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-on-demand-instances.html "With On-Demand Instances, you pay for compute capacity by the second with no long-term commitments."
- Savings Plans: commit to hourly spend for 1 or 3 years, save up to 72%. https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html "in exchange for a commitment of using a specified amount of compute power (measured per hour) for a one or three year period." and "You can save up to 72% on your AWS compute workloads."
- Compute Savings Plans cover any family, size, OS, Region, plus Fargate and Lambda. Same URL. "regardless of instance family, instance size, OS, tenancy, or AWS Region. This also applies to AWS Fargate and AWS Lambda usage."
- Reserved Instances: up to 72% off, plus capacity reservation when zonal. https://aws.amazon.com/ec2/pricing/reserved-instances/ "provide a significant discount (up to 72%) compared to On-Demand pricing and provide a capacity reservation when used in a specific Availability Zone."
- Spot: spare capacity, up to 90% off. https://aws.amazon.com/ec2/pricing/ "you can use spare Amazon EC2 capacity in the AWS Cloud. This capacity is available at a discount of up to 90% compared to On-Demand prices."
- Spot interruption notice is two minutes. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-instance-termination-notices.html "A Spot Instance interruption notice is a warning that is issued two minutes before Amazon EC2 stops or terminates your Spot Instance."
- No 2-minute warning when behavior is hibernate. Same URL. "you do not receive a two-minute warning because the hibernation process begins immediately."
- Dedicated Host = whole physical server. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/dedicated-hosts-overview.html "An Amazon EC2 Dedicated Host is a physical server that is fully dedicated for your use."
- Placement group strategies: cluster, partition, spread. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-groups.html "Cluster – Packs instances close together inside an Availability Zone." and "Partition – Spreads your instances across logical partitions so that groups of instances in one partition do not share the underlying hardware"
- Cluster group cannot span AZs. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-strategies.html "A cluster placement group can't span multiple Availability Zones."
- Spread group: 7 running instances per AZ. Same URL. "it supports a maximum of seven running instances in each Availability Zone. For example, in a Region with three Availability Zones, you can run a total of 21 instances in a spread placement group"
- Partition group: max 7 partitions per AZ, no instance cap beyond account limits. Same URL. "A partition placement group can have a maximum of seven partitions per Availability Zone."

## 3. VPS vs EC2 (Lightsail)

- What a VPS is. https://aws.amazon.com/what-is/vps/ "A virtual private server(VPS) is a machine that hosts all the software and data required to run an application or website."
- A VPS uses a part of one physical server. Same URL. "It is called virtual because it only consumes a portion of the server's underlying physical resources"
- A VPS user gets dedicated resources in a VM. Same URL. "In VPS hosting, each user receives a virtual machine with dedicated resources that is ready for them to deploy and configure their application or website."
- Lightsail is the AWS VPS product. https://aws.amazon.com/lightsail/ "Amazon Lightsail offers easy-to-use virtual private server (VPS) instances, containers, storage, databases, and more at a cost-effective monthly price."
- Lightsail bundles CPU, RAM and SSD in one plan. https://aws.amazon.com/lightsail/pricing/ "Lightsail bundles resources like memory, vCPU, and solid-state drive (SSD) storage into one plan, so budgeting is easy and straightforward."
- Lightsail docs: low, predictable monthly price. https://docs.aws.amazon.com/lightsail/latest/userguide/what-is-amazon-lightsail.html "for a low, predictable monthly price."
- Example bundle (as of 2026-10-07): $3.50/mo for 512 MB RAM, 2 vCPUs, 20 GB SSD, 1 TB transfer. https://aws.amazon.com/lightsail/pricing/ "$3.50 USD/mo 512 MB Memory 2 vCPUs 20 GB SSD Disk 1 TB Transfer*" (this is an IPv6-only bundle row; check the page for IPv4 prices).
- Another bundle: $5/mo, 1 GB, 2 vCPUs, 40 GB, 2 TB. Same URL. "$5 USD/mo 1 GB Memory 2 vCPUs 40 GB SSD Disk 2 TB Transfer*"
- Data transfer allowance is part of the bundle; only outbound over the allowance costs extra. Same URL. "Only outbound data transfer in excess of your plan's data transfer allowance is subject to overage charges."
- Lightsail is easy to move to the wider AWS ecosystem. https://aws.amazon.com/lightsail/ "Easily scale as you grow or migrate your resources to the broader AWS eco" (text cut by the page extraction; the page says ecosystem).

## 4. EBS, instance store, EFS

- gp3 baseline: 3,000 IOPS, included in the price. https://docs.aws.amazon.com/ebs/latest/userguide/general-purpose.html "gp3 volumes deliver a consistent baseline IOPS performance of 3,000 IOPS, which is included with the price of storage."
- gp3 baseline throughput 125 MiB/s. Same URL. "gp3 volumes deliver a consistent baseline throughput performance of 125 MiB/s, which is included with the price of storage."
- gp3 maximum (extra cost): 80,000 IOPS and 2,000 MiB/s. Same URL. "You can provision additional IOPS (up to a maximum of 80,000)" and "up to a maximum of 2,000 MiB/s"
- gp3 size 1 GiB to 64 TiB. Same URL. "A gp3 volume can range in size from 1 GiB to 64 TiB."
- io2 Block Express: up to 256,000 IOPS, 64 TiB. https://docs.aws.amazon.com/ebs/latest/userguide/provisioned-iops.html "Storage capacity up to 64 TiB (65,536 GiB). Provisioned IOPS up to 256,000, with an IOPS:GiB ratio of 1,000:1."
- io2 Block Express durability. Same URL. "io2 Block Express volumes are designed to provide 99.999 percent volume durability"
- io2 Block Express latency. Same URL. "Average latency under 500 microseconds for 16KiB I/O"
- st1 and sc1 are HDD types. https://docs.aws.amazon.com/ebs/latest/userguide/hdd-vols.html "Throughput Optimized HDD — A low-cost HDD designed for frequently accessed, throughput-intensive workloads. Cold HDD — The lowest-cost HDD designed for less frequently accessed workloads."
- st1 max 500 MiB/s, baseline 40 MiB/s per TiB. Same URL. "throughput capped at a maximum of 500 MiB/s" and "baseline rate of 40 MiB/s per TiB"
- st1 and sc1 cannot boot. Same URL. "Bootable st1 volumes are not supported."
- Volume and instance must be in the same AZ. https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes.html "The volume and instance must be in the same Availability Zone."
- Volume data is replicated inside the AZ. https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html "volume data is automatically replicated across multiple servers in an Availability Zone"
- Snapshots are incremental. https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html "A snapshot is an incremental backup, which means that we save only the blocks on the volume that have changed since the most recent snapshot."
- Snapshots are stored in S3 (not visible in your buckets). Same URL. "Snapshots are stored in Amazon S3, in S3 buckets that you can't access directly."
- Snapshots can restore across AZs, Regions and accounts. https://docs.aws.amazon.com/ebs/latest/userguide/what-is-ebs.html "migrate data across AWS accounts, AWS Regions, or Availability Zones"
- Multi-Attach: io1 or io2, same AZ. https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes-multi.html "Amazon EBS Multi-Attach enables you to attach a single Provisioned IOPS SSD (io1 or io2) volume to multiple instances that are in the same Availability Zone."
- Multi-Attach limit 16 Nitro instances. Same URL. "Multi-Attach enabled volumes can be attached to up to 16 instances built on the Nitro System that are in the same Availability Zone."
- Instance store is temporary, on disks in the host. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html "An instance store provides temporary block-level storage for your EC2 instance. This storage is provided by disks that are physically attached to the host computer."
- Instance store lifetime: survives reboot, not stop/hibernate/terminate. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-store-lifetime.html "The data on an instance store volume persists even if the instance is rebooted. However, the data does not persist if the instance is stopped, hibernated, or terminated."
- Instance store is erased on stop or terminate. Same URL. "every block of the instance store volume is cryptographically erased."
- EFS speaks NFS. https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html "Amazon EFS supports the Network File System version 4 (NFSv4.1 and NFSv4.0) protocol"
- EFS Regional file systems span multiple AZs. Same URL. "Regional file systems (recommended) store data redundantly across multiple geographically separated Availability Zones within the same AWS Region."
- EFS One Zone stores in one AZ. Same URL. "One Zone file systems store data within a single Availability Zone."
- Many clients at once. https://docs.aws.amazon.com/efs/latest/ug/how-it-works.html "You can access your EFS file system concurrently from multiple NFS clients"
- Scale of clients. https://aws.amazon.com/efs/faq/ "Tens, hundreds, or even thousands of compute instances can access an Amazon EFS file system at the same time"

## 5. EC2 Auto Scaling

- An ASG is a group of instances managed together. https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-groups.html "An Auto Scaling group contains a collection of EC2 instances that are treated as a logical grouping for the purposes of automatic scaling and management."
- Min / desired / max. https://docs.aws.amazon.com/autoscaling/ec2/userguide/asg-capacity-limits.html "The desired capacity must be equal to or greater than the minimum group size, and equal to or less than the maximum group size."
- The group keeps desired count with health checks. https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-groups.html "An Auto Scaling group starts by launching enough instances to meet its desired capacity. It maintains this number of instances by performing periodic health checks"
- Launch template content. https://docs.aws.amazon.com/autoscaling/ec2/userguide/launch-templates.html "It includes the ID of the Amazon Machine Image (AMI), the instance type, a key pair, security groups, and other parameters used to launch EC2 instances."
- Health check types: EC2 status checks is the default; ELB, VPC Lattice, EBS and custom must be turned on. https://docs.aws.amazon.com/autoscaling/ec2/userguide/health-checks-overview.html "This is the default health check type for an Auto Scaling group." and "To run this health check type, you must turn it on for your Auto Scaling group."
- ELB check meaning. Same URL. "Checks whether the load balancer reports the instance as healthy, confirming whether the instance is available to handle requests."
- Unhealthy instance is replaced. https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-health-checks.html "If any of the health checks fail, the instance is replaced."
- Health check grace period default: 300 s in console, 0 s in CLI/SDK. https://docs.aws.amazon.com/autoscaling/ec2/userguide/health-check-grace-period.html "In the console, by default, the health check grace period is 300 seconds when you create an Auto Scaling group. Its default value is 0 seconds when you create an Auto Scaling group using the AWS CLI or an SDK."
- Dynamic policies: target tracking, step, simple. https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scale-based-on-demand.html "Target tracking scaling —Increase and decrease the current capacity of the group based on a Amazon CloudWatch metric and a target value." "Step scaling —" "Simple scaling —"
- Simple scaling uses one adjustment plus a cooldown, and AWS recommends target tracking. Same URL. "Simple scaling —Increase and decrease the current capacity of the group based on a single scaling adjustment, with a cooldown period between each scaling activity."
- Scheduled scaling. https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-scheduled-scaling.html "You create scheduled actions that increase or decrease your group's desired capacity at specific times."
- Predictive scaling. https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-predictive-scaling.html "It uses this information to forecast future capacity needs so Amazon EC2 Auto Scaling can proactively increase the capacity of your Auto Scaling group to match the anticipated load."
- Default cooldown 300 s. https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-scaling-cooldowns.html "If the default cooldown is not defined, the default value of 300 seconds is used."
- AWS advises against simple scaling and cooldowns. Same URL. "As a best practice, we recommend that you do not use simple scaling policies and scaling cooldowns."
- Default instance warmup is off by default. https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-default-instance-warmup.html "It is not enabled or configured by default."
- Warmup meaning. Same URL. "You can specify how long after an instance reaches the InService state it waits before contributing usage data to the aggregated metrics."
- Default termination policy keeps AZs balanced first. https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-termination-policies.html "Maintaining Zonal balance takes precedence over the termination policy."
- Then it removes instances with outdated configuration first. Same URL. "By default, Amazon EC2 Auto Scaling uses a termination policy that's designed to terminate instances that are using outdated configurations first."
- Lifecycle hooks pause an instance, default wait one hour. https://docs.aws.amazon.com/autoscaling/ec2/userguide/lifecycle-hooks.html "A lifecycle hook provides a specified amount of time (one hour by default) to wait for the action to complete before the instance transitions to the next state."
- Instance refresh replaces instances to roll out a change. https://docs.aws.amazon.com/autoscaling/ec2/userguide/asg-instance-refresh.html "Deploying a new Amazon Machine Image (AMI) or user data script across your Auto Scaling group."
- Warm pool = pre-initialized instances. https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-warm-pools.html "A warm pool gives you the ability to decrease latency for your applications that have exceptionally long boot times"
- Warm pool cost warning. Same URL. "Creating a warm pool when it's not required can lead to unnecessary costs."

## 6. ECS

- Components: task definition, cluster, task, service. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html "Task definition The blueprint for the application. Cluster The infrastructure your application runs on. Task An application such as a batch job that performs work, and then stops. Service A long running stateless application."
- Task definition. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html "A task definition is a blueprint for your application. It is a text file in JSON format that describes the parameters and one or more containers that form your application."
- Cluster. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html "An Amazon ECS cluster is a logical grouping of tasks or services that provides the infrastructure capacity for your containerized applications."
- Service scheduler replaces failed tasks. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs_services.html "If one of your tasks fails or stops, the Amazon ECS service scheduler launches another instance of your task definition to replace it. This helps maintain your desired number of tasks in the service."
- Capacity options now: ECS Managed Instances, Fargate, EC2. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html "Amazon ECS offers three infrastructure types for your clusters: Amazon ECS Managed Instances - AWS fully manages the underlying Amazon EC2 instances running in your account"
- Fargate and EC2 option text. Same URL. "Serverless (Fargate) - Pay only for the resources your tasks use without managing any infrastructure." and "Amazon EC2 instances - You manage the underlying Amazon EC2 instances directly"
- ECS Anywhere. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-anywhere.html "Amazon ECS Anywhere provides support for registering an external instance such as an on-premises server or virtual machine (VM), to your Amazon ECS cluster."
- ECS Anywhere limit: no load balancer for inbound. Same URL. "External instances are optimized for running applications that generate outbound traffic or process data."
- awsvpc gives each task an ENI. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-networking-awsvpc.html "Amazon ECS creates the ENI and attaches it to the host Amazon EC2 instance with the specified security group."
- awsvpc effect. Same URL. "The task networking features that are provided by the awsvpc network mode give Amazon ECS tasks the same networking properties as Amazon EC2 instances."
- Fargate requires awsvpc. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-tasks-services.html "Amazon ECS tasks for AWS Fargate require the awsvpc network mode, which provides each task with an elastic network interface."
- Rolling deployment defaults: minimumHealthyPercent 100% for REPLICA. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service_definition_parameters.html "The default value for a replica service for minimumHealthyPercent is 100%."
- maximumPercent default 200% for REPLICA. Same URL. "The default maximumPercent value for a service using the REPLICA service scheduler is 200%."
- Example of 200%. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-ecs.html "if the maximum percent is 200 and the desired task count is four, then the scheduler can start four new tasks before stopping four existing tasks."
- Task execution role is for the ECS agent and Fargate agent (pull images, logs). https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html "The task execution role grants the Amazon ECS container and Fargate agents permission to make AWS API calls on your behalf."
- Task role is for your app code. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html "This role allows your application code (running in the container) to use other AWS services."
- Task role not used by the agents. Same URL. "These permissions aren't accessed by the Amazon ECS container and Fargate agents."
- ECR stores container images. https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html "You can use your preferred CLI to push, pull, and manage Docker images, Open Container Initiative (OCI) images, and OCI compatible artifacts."
- Fargate task sizes: 0.25 vCPU (256) with 512 MiB to 2 GB. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-tasks-services.html "256 (.25 vCPU) 512 MiB, 1 GB, 2 GB Linux"
- Fargate sizes up to 16 vCPU and, on the current page, 32 vCPU (see Not confirmed). Same URL. "16384 (16 vCPU)" and "32768 (32 vCPU)"
- 16 vCPU memory range. Same URL. "Between 32 GB and 120 GB in 8 GB increments Linux 32768 (32 vCPU)" (the page text puts the row range before the label, so the 32 GB to 120 GB range goes with 16 vCPU).

## 7. EKS

- Managed control plane. https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html "EKS standard: AWS manages the Kubernetes control plane when you create a cluster with EKS."
- Control plane layout: at least 2 API server and 3 etcd instances over 3 AZs. https://docs.aws.amazon.com/eks/latest/userguide/eks-architecture.html "control plane positions at least two API server instances and three etcd instances across three AWS Availability Zones within an AWS Region."
- Control plane replacement. Same URL. "If a control plane instance falters, Amazon EKS quickly replaces it, using a different Availability Zone"
- FAQ wording. https://aws.amazon.com/eks/faqs/ "application programming interface (API) servers and backend persistence layer, across multiple AWS Availability Zones (AZs) for high availability and fault tolerance."
- Node options. https://docs.aws.amazon.com/eks/latest/userguide/eks-compute.html "Your Amazon EKS cluster can schedule Pods on any combination of EKS Auto Mode managed nodes, self-managed nodes, Amazon EKS managed node groups, AWS Fargate, and Amazon EKS Hybrid Nodes."
- Managed node groups run as an EC2 ASG in your account. https://docs.aws.amazon.com/eks/latest/userguide/managed-node-groups.html "Every managed node is provisioned as part of an Amazon EC2 Auto Scaling group that's managed for you by Amazon EKS."
- Price standard support: $0.10 per cluster per hour. https://aws.amazon.com/eks/pricing/ "Standard Kubernetes version support $0.10 per cluster per hour"
- Price extended support: $0.60 per cluster per hour. Same URL. "Extended Kubernetes version support $0.60 per cluster per hour (Standard Kubernetes version support + $0.50 per cluster per hour)"
- Standard support 14 months, extended 12 months. https://docs.aws.amazon.com/eks/latest/userguide/kubernetes-versions.html "A minor version is under standard support in Amazon EKS for the first 14 months after it's released. Once a version is past the end of standard support date, it enters extended support for the next 12 months."
- After extended support ends the cluster is auto-upgraded. Same URL. "If you haven't updated your cluster before the extended support period ends, your cluster is auto-upgraded"
- IRSA. https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html "IAM roles for service accounts (IRSA) provide the ability to manage credentials for your applications, similar to the way that Amazon EC2 instance profiles provide credentials to Amazon EC2 instances."
- Pod Identity. https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html "you associate an IAM role with a Kubernetes service account and configure your Pods to use the service account."
- Pod Identity association scope. Same URL. "Each EKS Pod Identity association maps a role to a service account in a namespace in the specified cluster."
- Best practices page says at least two API server nodes in distinct AZs. https://docs.aws.amazon.com/eks/latest/best-practices/control-plane.html "EKS runs a minimum of two API server nodes in distinct Availability Zones (AZs) within an AWS Region."

## 8. Lambda

- Init phase has three tasks. https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html "In the Init phase, Lambda performs three tasks: Start all extensions (Extension init) Bootstrap the runtime (Runtime init) Run the function's static code (Function init)"
- Init phase limit 10 s. Same URL. "The Init phase is limited to 10 seconds."
- Shutdown sends an event to extensions. Same URL. "When Lambda is about to shut down the runtime, it sends a Shutdown event to each registered external extension."
- Shutdown time limits. Same URL. "0 ms – A function with no registered extensions 500 ms – A function with a registered internal extension 2,000 ms – A function with one or more registered external extensions"
- Warm start reuses the environment. Same URL. "When the function is invoked again, Lambda thaws the environment for reuse." and "This is called a "warm start"."
- Cold start rate. Same URL. "Cold starts typically occur in under 1% of invocations. The duration of a cold start varies from under 100 ms to over 1 second."
- Cold start definition. https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html "When Lambda has to initialize a new environment to carry out an invocation, this is known as a cold start."
- Max timeout 900 s. https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html "Function timeout 900 seconds (15 minutes)."
- Memory 128 to 10,240 MB, CPU in proportion, 1 vCPU at 1,769 MB. Same URL. "128 MB to 10,240 MB, in 1-MB increments. Note: Lambda allocates CPU power in proportion to the amount of memory configured." and "At 1,769 MB, a function has the equivalent of one vCPU."
- /tmp 512 to 10,240 MB. Same URL. "/tmp directory storage Between 512 MB and 10,240 MB, in 1-MB increments"
- Same, config page. https://docs.aws.amazon.com/lambda/latest/dg/configuration-ephemeral-storage.html "You can configure ephemeral storage between 512 MB and 10,240 MB, in 1-MB increments."
- Default concurrency 1,000 per Region (can be raised). https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html "By default, Lambda provides your account with a total concurrency limit of 1,000 concurrent executions across all functions in an AWS Region."
- Concurrency definition. Same URL. "Concurrency is the number of in-flight requests that your AWS Lambda function is handling at the same time."
- Scaling rate. https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html "1,000 execution environments every 10 seconds" (the page gives this per function).
- Provisioned concurrency. https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html "Provisioned concurrency is the number of pre-initialized execution environments that you want to allocate to your function."
- Reserved concurrency caps a function and holds its share. Same URL. "You use reserved concurrency to define the maximum number of execution environments reserved for a Lambda function." and "If your function doesn't use up all of the concurrency that you reserve for it, you're effectively wasting that concurrency."
- Reserved environments are not pre-initialized. Same URL. "However, none of these environments come pre-initialized."
- Sync invoke waits. https://docs.aws.amazon.com/lambda/latest/dg/invocation-sync.html "When you invoke a function synchronously, Lambda runs the function and waits for a response."
- Async invoke queues the event. https://docs.aws.amazon.com/lambda/latest/dg/invocation-async.html "When you invoke a function asynchronously, you don't wait for a response from the function code. You hand off the event to Lambda and Lambda handles the rest." and "Lambda places the event in a queue"
- Async retries twice, waits 1 min then 2 min. https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-error-handling.html "by default Lambda attempts to run it two more times, with a one-minute wait between the first two attempts, and two minutes between the second and third attempts."
- Payload limits. https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html "6 MB each for request and response (synchronous) 200 MB for each streamed response (synchronous) 1 MB (asynchronous)"
- Event source mapping reads queues and streams. https://docs.aws.amazon.com/lambda/latest/dg/invocation-eventsourcemapping.html "An event source mapping is a Lambda resource that reads items from stream and queue-based services and invokes a function with batches of records."
- SQS: Lambda polls and invokes synchronously with a batch. https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html "With Amazon SQS event source mappings, Lambda polls the queue and invokes your function synchronously with an event. Each event can contain a batch of multiple messages from the queue."
- SnapStart. https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html "Lambda initializes your function when you publish a function version. Lambda takes a Firecracker MicroVM snapshot of the memory and disk state of the initialized execution environment"
- SnapStart runtimes. Same URL. "Java 11 and later Python 3.12 and later .NET 8 and later."
- SnapStart gain. Same URL. "Lambda SnapStart can provide as low as sub-second startup performance, typically with no changes to your function code."
- New: Lambda Managed Instances can allow up to 5,400 s for async and event source invocations. https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html "support a maximum allowed value of 5,400 seconds (90 minutes)"

## 9. API Gateway

- Three API types: REST, HTTP, WebSocket. https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html "an AWS service for creating, publishing, maintaining, monitoring, and securing REST, HTTP, and WebSocket APIs at any scale."
- REST vs HTTP. https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html "REST APIs support more features than HTTP APIs, while HTTP APIs are designed with minimal features so that they can be offered at a lower price."
- When to pick REST. Same URL. "Choose REST APIs if you need features such as API keys, per-client throttling, request validation, AWS WAF integration, or private API endpoints."
- Endpoint types: REST has edge-optimized, regional, private; HTTP has regional only. Same URL. "Edge-optimized Yes No Regional Yes Yes Private Yes No"
- WebSocket API. https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html "A WebSocket API in API Gateway is a collection of WebSocket routes that are integrated with backend HTTP endpoints, Lambda functions, or other AWS services."
- WebSocket limits: 2 hour connection, 10 min idle, 128 KB message. https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-execution-service-websocket-limits-table.html "Connection duration for WebSocket API 2 hours No Idle Connection Timeout 10 minutes No"
- REST integration timeout 50 ms to 29 s. https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-execution-service-limits-table.html "Integration timeout for Regional APIs 50 milliseconds - 29 seconds for all integration types, including Lambda, Lambda proxy, HTTP, HTTP proxy, and AWS integrations."
- It can now be raised above 29 s for Regional and private REST APIs (not edge-optimized), with a throttle trade-off. Same URL. "You can raise the integration timeout to greater than 29 seconds, but this might require a reduction in your Region-level throttle quota for your account."
- Edge-optimized REST: not raisable. Same URL. "Integration timeout for edge-optimized APIs 50 milliseconds - 29 seconds ... No"
- HTTP API max integration timeout 30 s. https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-quotas.html "Maximum integration timeout 30 seconds No"
- WebSocket integration timeout 29 s, fixed. https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-execution-service-websocket-limits-table.html "Integration timeout 50 milliseconds - 29 seconds for all integration types"
- Account throttle: 10,000 rps with a token bucket of 5,000. https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html "10,000 requests per second (RPS) with an additional burst capacity provided by the token bucket algorithm, using a maximum bucket capacity of 5,000 requests."
- Scope: per account, per Region, across all API types. Same URL. "per account, per Region across HTTP APIs, REST APIs, WebSocket APIs, and WebSocket callback APIs"
- Burst is not customer-controlled. Same URL. "It is not a quota that a customer can control or request changes to."
- Some Regions have lower defaults (2,500 rps, 1,250 burst), for example Africa (Cape Town), Europe (Milan), Asia Pacific (Jakarta). Same URL. "the default throttle quota is 2500 RPS and the default burst quota is 1250 RPS"
- Throttling algorithm. https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html "In the token bucket algorithm, a burst can allow pre-defined overrun of those limits"
- Usage plans and API keys (REST only). https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html "A usage plan specifies who can access one or more deployed API stages and methods—and optionally sets the target request rate to start throttling requests. The plan uses API keys to identify API clients"
- Authorizer options table. https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html "IAM Yes Yes Resource policies Yes No Amazon Cognito Yes Yes Custom authorization with an AWS Lambda function Yes Yes JSON Web Token (JWT) No Yes"
- REST can validate JWTs with a Lambda authorizer; Cognito works with HTTP via JWT authorizer. Same URL. "You can use Amazon Cognito with a JWT authorizer." and "You can use a Lambda authorizer to validate JWTs for REST APIs."
- Lambda authorizer. https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html "Use a Lambda authorizer (formerly known as a custom authorizer) to control access to your API." Types: TOKEN and REQUEST.
- JWT authorizer. https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html "If you configure a JWT authorizer for a route of your API, API Gateway validates the JWTs that clients submit with API requests."

## Not confirmed / differences from the brief

- Number of Regions: the global infrastructure page says 39 Regions and 124 AZs. The Regions user guide table (https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html) still says "There are currently 34 Regions." Use 39 / 124, and write that the docs table lags.
- "Edge locations count": AWS now says "POPs" (750+ CloudFront POPs, 15 Regional edge caches, plus 1,140+ embedded POPs on the CloudFront page). No page I found gives one number named "edge locations".
- gp3 "max": the brief says baseline 3,000 IOPS and 125 MiB/s as max. The docs say these are the baseline. The maximum is 80,000 IOPS and 2,000 MiB/s (extra cost).
- Fargate task size: the brief says up to 16 vCPU. The current page lists 32 vCPU (32768) too. The page text is flattened, so the row-to-memory pairing for 16 and 32 vCPU is inferred from row order.
- ECS capacity: the brief lists EC2, Fargate, ECS Anywhere. The current docs also list ECS Managed Instances as a third cluster infrastructure type; ECS Anywhere is described as external instances, not under "launch types".
- API Gateway 29 s on REST: it is no longer a hard limit for Regional and private REST APIs (raisable). Edge-optimized REST, WebSocket stay at 29 s. HTTP API is 30 s fixed.
- ASG health check grace period default: no single default. Console 300 s, CLI/SDK 0 s.
- Instance type example "m7g.large" does not appear on the naming page. The table supports the reading (M, generation 7, g = Graviton, large).
- Lightsail "fixed monthly bundles": the pages say "low, predictable monthly price" and "bundles"; the word "fixed" does not appear. Prices on 2026-10-07 are examples, and the $3.50 row is under the "IPv6 address only" bundles.
- Lambda "default regional concurrency 1,000": confirmed as the default account limit. The limits page shows "Can be increased up to Tens of thousands".
- IMDSv2 required by default: not checked.
- Per-second billing "for Linux": the page lists Amazon Linux, Windows, RHEL, Ubuntu and says it applies to all purchase options. Other Linux distributions are not named.
