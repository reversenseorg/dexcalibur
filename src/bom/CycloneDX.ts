import {Nullable} from "../core/IStringIndex.js";

export namespace CycloneDX {


    export type Timestamp = number;

    export class CycloneDxSpecification {
        readonly version: string = "cyclonedx.v1_5";

    }

    // Specifies attributes of the text
    export interface AttachedText {
        // Specifies the content type of the text. Defaults to text/plain if not specified.
        content_type?: Nullable<string>;
        // Specifies the optional encoding the text is represented in
        encoding?: Nullable<string>;
        // SimpleContent value of element. Proactive controls such as input validation and sanitization should be employed to prevent misuse of attachment text.
        value: string;
    }

    export interface Bom {
        // The version of the CycloneDX specification a BOM is written to (starting at version 1.3)
        spec_version: string;
        // The version allows component publishers/authors to make changes to existing BOMs to update various aspects of the document such as description or licenses. When a system is presented with multiple BOMs for the same component, the system should use the most recent version of the BOM. The default version is '1' and should be incremented for each version of the BOM that is published. Each version of a component should have a unique BOM and if no changes are made to the BOMs, then each BOM will have a version of '1'.
        version?: Nullable<number>;
        // Every BOM generated should have a unique serial number, even if the contents of the BOM being generated have not changed over time. The process or tool responsible for creating the BOM should create random UUID's for every BOM generated.
        serial_number?: Nullable<string>;
        // Provides additional information about a BOM.
        metadata?: Nullable<Metadata>;
        // Provides the ability to document a list of components.
        components: Component[];
        // Provides the ability to document a list of external services.
        services: Service[];
        // Provides the ability to document external references related to the BOM or to the project the BOM describes.
        external_references: ExternalReference[];
        // Provides the ability to document dependency relationships.
        dependencies: Dependency[];
        // Compositions describe constituent parts (including components, services, and dependency relationships) and their completeness. The completeness of vulnerabilities expressed in a BOM may also be described.
        compositions: Composition[];
        // Vulnerabilities identified in components or services.
        vulnerabilities: Vulnerability[];
        // Comments made by people, organizations, or tools about any object with a bom-ref, such as components, services, vulnerabilities, or the BOM itself. Unlike inventory information, annotations may contain opinion or commentary from various stakeholders.
        annotations: Annotation[];
        // Specifies optional, custom, properties
        properties: Property[];
        // Describes how a component or service was manufactured or deployed. This is achieved through the use of formulas, workflows, tasks, and steps, which declare the precise steps to reproduce along with the observed formulas describing the steps which transpired in the manufacturing process.
        formulation: Formula[];
    }

    export enum Classification {
        CLASSIFICATION_NULL,
        // A software application. Refer to https://en.wikipedia.org/wiki/Application_software for information about applications.
        CLASSIFICATION_APPLICATION,
        // A software framework. Refer to https://en.wikipedia.org/wiki/Software_framework for information on how frameworks vary slightly from libraries.
        CLASSIFICATION_FRAMEWORK,
        // A software library. Refer to https://en.wikipedia.org/wiki/Library_(computing) for information about libraries. All third-party and open source reusable components will likely be a library. If the library also has key features of a framework, then it should be classified as a framework. If not, or is unknown, then specifying library is recommended.
        CLASSIFICATION_LIBRARY,
        // A software operating system without regard to deployment model (i.e. installed on physical hardware, virtual machine, image, etc) Refer to https://en.wikipedia.org/wiki/Operating_system
        CLASSIFICATION_OPERATING_SYSTEM,
        // A hardware device such as a processor, or chip-set. A hardware device containing firmware should include a component for the physical hardware itself, and another component of type 'firmware' or 'operating-system' (whichever is relevant), describing information about the software running on the device. See also the list of known device properties: https://github.com/CycloneDX/cyclonedx-property-taxonomy/blob/main/cdx/device.md
        CLASSIFICATION_DEVICE,
        // A computer file. Refer to https://en.wikipedia.org/wiki/Computer_file for information about files.
        CLASSIFICATION_FILE,
        // A packaging and/or runtime format, not specific to any particular technology, which isolates software inside the container from software outside of a container through virtualization technology. Refer to https://en.wikipedia.org/wiki/OS-level_virtualization
        CLASSIFICATION_CONTAINER,
        // A special type of software that provides low-level control over a devices hardware. Refer to https://en.wikipedia.org/wiki/Firmware
        CLASSIFICATION_FIRMWARE,
        // A special type of software that operates or controls a particular type of device. Refer to https://en.wikipedia.org/wiki/Device_driver
        CLASSIFICATION_DEVICE_DRIVER,
        // A runtime environment which interprets or executes software. This may include runtimes such as those that execute bytecode or low-code/no-code application platforms.
        CLASSIFICATION_PLATFORM,
        // A model based on training data that can make predictions or decisions without being explicitly programmed to do so.
        CLASSIFICATION_MACHINE_LEARNING_MODEL,
        // A collection of discrete values that convey information.
        CLASSIFICATION_DATA
    }

    export interface Commit {
        // A unique identifier of the commit. This may be version control specific. For example, Subversion uses revision numbers whereas git uses commit hashes.
        uid?: Nullable<string>;
        // The URL to the commit. This URL will typically point to a commit in a version control system.
        url?: Nullable<string>;
        // The author who created the changes in the commit
        author?: Nullable<IdentifiableAction>;
        // The person who committed or pushed the commit
        committer?: Nullable<IdentifiableAction>;
        // The text description of the contents of the commit
        message?: Nullable<string>;
    }

    export interface Component {
        // Specifies the type of component. For software components, classify as application if no more specific appropriate classification is available or cannot be determined for the component.
        type?: Nullable<Classification>;
        // The optional mime-type of the component. When used on file components, the mime-type can provide additional context about the kind of file being represented such as an image, font, or executable. Some library or framework components may also have an associated mime-type.
        mime_type?: Nullable<string>;
        // An optional identifier which can be used to reference the component elsewhere in the BOM. Uniqueness is enforced within all elements and children of the root-level bom element.
        bom_ref?: Nullable<string>;
        // The organization that supplied the component. The supplier may often be the manufacture, but may also be a distributor or repackager.
        supplier?: Nullable<OrganizationalEntity>;
        // The person(s) or organization(s) that authored the component
        author?: Nullable<string>;
        // The person(s) or organization(s) that published the component
        publisher?: Nullable<string>;
        // The grouping name or identifier. This will often be a shortened, single name of the company or project that produced the component, or the source package or domain name. Whitespace and special characters should be avoided. Examples include: apache, org.apache.commons, and apache.org.
        group?: Nullable<string>;
        // The name of the component. This will often be a shortened, single name of the component. Examples: commons-lang3 and jquery
        name: string;
        // The component version. The version should ideally comply with semantic versioning but is not enforced. Version was made optional in v1.4 of the spec. For backward compatibility, it is RECOMMENDED to use an empty string to represent components without version information.
        version: string;
        // Specifies a description for the component
        description?: Nullable<string>;
        // Specifies the scope of the component. If scope is not specified, 'runtime' scope should be assumed by the consumer of the BOM
        scope?: Nullable<Scope>;
        hashes: Hash[];
        licenses: LicenseChoice[];
        // An optional copyright notice informing users of the underlying claims to copyright ownership in a published work.
        copyright?: Nullable<string>;
        // DEPRECATED - DO NOT USE. This will be removed in a future version. Specifies a well-formed CPE name. See https://nvd.nist.gov/products/cpe
        cpe?: Nullable<string>;
        // Specifies the package-url (PURL). The purl, if specified, must be valid and conform to the specification defined at: https://github.com/package-url/purl-spec
        purl?: Nullable<string>;
        // Specifies metadata and content for ISO-IEC 19770-2 Software Identification (SWID) Tags.
        swid?: Nullable<Swid>;
        // DEPRECATED - DO NOT USE. This will be removed in a future version. Use the pedigree element instead to supply information on exactly how the component was modified. A boolean value indicating is the component has been modified from the original. A value of true indicates the component is a derivative of the original. A value of false indicates the component has not been modified from the original.
        modified?: Nullable<boolean>;
        // Component pedigree is a way to document complex supply chain scenarios where components are created, distributed, modified, redistributed, combined with other components, etc.
        pedigree?: Nullable<Pedigree>;
        // Provides the ability to document external references related to the component or to the project the component describes.
        external_references: ExternalReference[];
        // Specifies optional sub-components. This is not a dependency tree. It provides a way to specify a hierarchical representation of component assemblies, similar to system -> subsystem -> parts assembly in physical supply chains.
        components: Component[];
        // Specifies optional, custom, properties
        properties: Property[];
        // Specifies optional license and copyright evidence
        evidence: Evidence[];
        // Specifies optional release notes.
        releaseNotes?: Nullable<ReleaseNotes>;
        // A model card describes the intended uses of a machine learning model, potential limitations, biases, ethical considerations, training parameters, datasets used to train the model, performance metrics, and other relevant data useful for ML transparency.
        modelCard?: Nullable<ModelCard>;
        // This object SHOULD be specified for any component of type `data` and MUST NOT be specified for other component types.
        data?: Nullable<ComponentData>;
    }

    // Specifies the data flow.
    export interface DataFlow {
        // Specifies the flow direction of the data.
        flow?: Nullable<DataFlowDirection>;
        // Data classification tags data according to its type, sensitivity, and value if altered, stolen, or destroyed.
        value: string;
        // Name for the defined data
        name?: Nullable<string>;
        // Short description of the data content and usage
        description?: Nullable<string>;
        // The URI, URL, or BOM-Link of the components or services the data came in from
        source: string[];
        // The URI, URL, or BOM-Link of the components or services the data is sent to
        destination: string[];
        // Data Governance
        governance?: Nullable<DataGovernance>;
    }

    // Specifies the flow direction of the data. Valid values are: inbound, outbound, bi-directional, and unknown. Direction is relative to the service. Inbound flow states that data enters the service. Outbound flow states that data leaves the service. Bi-directional states that data flows both ways, and unknown states that the direction is not known.
    export enum DataFlowDirection {
        DATA_FLOW_NULL,
        DATA_FLOW_INBOUND,
        DATA_FLOW_OUTBOUND,
        DATA_FLOW_BI_DIRECTIONAL,
        DATA_FLOW_UNKNOWN
    }

    export interface Dependency {
        // References a component or service by the its bom-ref attribute
        ref: string;
        dependencies: Dependency[];
    }

    export interface Diff {
        // Specifies the optional text of the diff
        text?: Nullable<AttachedText>;
        // Specifies the URL to the diff
        url?: Nullable<string>;
    }

    export interface ExternalReference {
        // Specifies the type of external reference. There are built-in types to describe common references. If a type does not exist for the reference being referred to, use the "other" type.
        type?: Nullable<ExternalReferenceType>;
        // The URL to the external reference
        url: string;
        // An optional comment describing the external reference
        comment?: Nullable<string>;
        // Optional integrity hashes for the external resource content
        hashes: Hash[];
    }

    export enum ExternalReferenceType {
        // Use this if no other types accurately describe the purpose of the external reference
        EXTERNAL_REFERENCE_TYPE_OTHER,
        // Version Control System
        EXTERNAL_REFERENCE_TYPE_VCS,
        // Issue or defect tracking system, or an Application Lifecycle Management (ALM) system
        EXTERNAL_REFERENCE_TYPE_ISSUE_TRACKER,
        // Website
        EXTERNAL_REFERENCE_TYPE_WEBSITE,
        // Security advisories
        EXTERNAL_REFERENCE_TYPE_ADVISORIES,
        // Bill-of-material document (CycloneDX, SPDX, SWID, etc)
        EXTERNAL_REFERENCE_TYPE_BOM,
        // Mailing list or discussion group
        EXTERNAL_REFERENCE_TYPE_MAILING_LIST,
        // Social media account
        EXTERNAL_REFERENCE_TYPE_SOCIAL,
        // Real-time chat platform
        EXTERNAL_REFERENCE_TYPE_CHAT,
        // Documentation, guides, or how-to instructions
        EXTERNAL_REFERENCE_TYPE_DOCUMENTATION,
        // Community or commercial support
        EXTERNAL_REFERENCE_TYPE_SUPPORT,
        // Direct or repository download location
        EXTERNAL_REFERENCE_TYPE_DISTRIBUTION,
        // The URL to the license file. If a license URL has been defined in the license node, it should also be defined as an external reference for completeness
        EXTERNAL_REFERENCE_TYPE_LICENSE,
        // Build-system specific meta file (i.e. pom.xml, package.json, .nuspec, etc)
        EXTERNAL_REFERENCE_TYPE_BUILD_META,
        // URL to an automated build system
        EXTERNAL_REFERENCE_TYPE_BUILD_SYSTEM,
        // Specifies a way to contact the maintainer, supplier, or provider in the event of a security incident. Common URIs include links to a disclosure procedure, a mailto (RFC-2368) that specifies an email address, a tel (RFC-3966) that specifies a phone number, or dns (RFC-4501]) that specifies the records containing DNS Security TXT.
        EXTERNAL_REFERENCE_TYPE_SECURITY_CONTACT,
        // Human or machine-readable statements containing facts, evidence, or testimony
        EXTERNAL_REFERENCE_TYPE_ATTESTATION,
        // An enumeration of identified weaknesses, threats, and countermeasures, dataflow diagram (DFD), attack tree, and other supporting documentation in human-readable or machine-readable format
        EXTERNAL_REFERENCE_TYPE_THREAT_MODEL,
        // The defined assumptions, goals, and capabilities of an adversary.
        EXTERNAL_REFERENCE_TYPE_ADVERSARY_MODEL,
        // Identifies and analyzes the potential of future events that may negatively impact individuals, assets, and/or the environment. Risk assessments may also include judgments on the tolerability of each risk.
        EXTERNAL_REFERENCE_TYPE_RISK_ASSESSMENT,
        // The location where a component was published to. This is often the same as "distribution" but may also include specialized publishing processes that act as an intermediary
        EXTERNAL_REFERENCE_TYPE_DISTRIBUTION_INTAKE,
        // A Vulnerability Disclosure Report (VDR) which asserts the known and previously unknown vulnerabilities that affect a component, service, or product including the analysis and findings describing the impact (or lack of impact) that the reported vulnerability has on a component, service, or product
        EXTERNAL_REFERENCE_TYPE_VULNERABILITY_ASSERTION,
        // A Vulnerability Exploitability eXchange (VEX) which asserts the known vulnerabilities that do not affect a product, product family, or organization, and optionally the ones that do. The VEX should include the analysis and findings describing the impact (or lack of impact) that the reported vulnerability has on the product, product family, or organization
        EXTERNAL_REFERENCE_TYPE_EXPLOITABILITY_STATEMENT,
        // Results from an authorized simulated cyberattack on a component or service, otherwise known as a penetration test
        EXTERNAL_REFERENCE_TYPE_PENTEST_REPORT,
        // SARIF or proprietary machine or human-readable report for which static analysis has identified code quality, security, and other potential issues with the source code
        EXTERNAL_REFERENCE_TYPE_STATIC_ANALYSIS_REPORT,
        // Dynamic analysis report that has identified issues such as vulnerabilities and misconfigurations
        EXTERNAL_REFERENCE_TYPE_DYNAMIC_ANALYSIS_REPORT,
        // Report generated by analyzing the call stack of a running application
        EXTERNAL_REFERENCE_TYPE_RUNTIME_ANALYSIS_REPORT,
        // Report generated by Software Composition Analysis (SCA), container analysis, or other forms of component analysis
        EXTERNAL_REFERENCE_TYPE_COMPONENT_ANALYSIS_REPORT,
        // Report containing a formal assessment of an organization, business unit, or team against a maturity model
        EXTERNAL_REFERENCE_TYPE_MATURITY_REPORT,
        // Industry, regulatory, or other certification from an accredited (if applicable) certification body
        EXTERNAL_REFERENCE_TYPE_CERTIFICATION_REPORT,
        // Report or system in which quality metrics can be obtained
        EXTERNAL_REFERENCE_TYPE_QUALITY_METRICS,
        // Code or configuration that defines and provisions virtualized infrastructure, commonly referred to as Infrastructure as Code (IaC)
        EXTERNAL_REFERENCE_TYPE_CODIFIED_INFRASTRUCTURE,
        // A model card describes the intended uses of a machine learning model, potential limitations, biases, ethical considerations, training parameters, datasets used to train the model, performance metrics, and other relevant data useful for ML transparency.
        EXTERNAL_REFERENCE_TYPE_MODEL_CARD,
        // Plans of Action and Milestones (POAM) compliment an "attestation" external reference. POAM is defined by NIST as a "document that identifies tasks needing to be accomplished. It details resources required to accomplish the elements of the plan, any milestones in meeting the tasks and scheduled completion dates for the milestones".
        EXTERNAL_REFERENCE_TYPE_POAM,
        // A record of events that occurred in a computer system or application, such as problems, errors, or information on current operations.
        EXTERNAL_REFERENCE_TYPE_LOG,
        // Parameters or settings that may be used by other components or services.
        EXTERNAL_REFERENCE_TYPE_CONFIGURATION,
        // Information used to substantiate a claim.
        EXTERNAL_REFERENCE_TYPE_EVIDENCE,
        // Describes how a component or service was manufactured or deployed.
        EXTERNAL_REFERENCE_TYPE_FORMULATION
    }

    export enum HashAlg {
        HASH_ALG_NULL,
        HASH_ALG_MD_5,
        HASH_ALG_SHA_1,
        HASH_ALG_SHA_256,
        HASH_ALG_SHA_384,
        HASH_ALG_SHA_512,
        HASH_ALG_SHA_3_256,
        HASH_ALG_SHA_3_384,
        HASH_ALG_SHA_3_512,
        HASH_ALG_BLAKE_2_B_256,
        HASH_ALG_BLAKE_2_B_384,
        HASH_ALG_BLAKE_2_B_512,
        HASH_ALG_BLAKE_3
    }

    // Specifies the file hash of the component
    export interface Hash {
        // Specifies the algorithm used to create the hash
        alg?: Nullable<HashAlg>;
        // SimpleContent value of element
        value: string;
    }

    export interface IdentifiableAction {
        // The timestamp in which the action occurred
        timestamp: Nullable<Timestamp>;
        // The name of the individual who performed the action
        name?: Nullable<string>;
        // The email address of the individual who performed the action
        email?: Nullable<string>;
    }

    export enum IssueClassification {
        ISSUE_CLASSIFICATION_NULL,
        // A fault, flaw, or bug in software
        ISSUE_CLASSIFICATION_DEFECT,
        // A new feature or behavior in software
        ISSUE_CLASSIFICATION_ENHANCEMENT,
        // A special type of defect which impacts security
        ISSUE_CLASSIFICATION_SECURITY,
    }

    export interface Issue {
        // Specifies the type of issue
        type?: Nullable<IssueClassification>;
        // The identifier of the issue assigned by the source of the issue
        id?: Nullable<string>;
        // The name of the issue
        name?: Nullable<string>;
        // A description of the issue
        description?: Nullable<string>;
        source?: Nullable<Source>;
        references: string[];
    }

    // The source of the issue where it is documented.
    export interface Source {
        // The name of the source. For example "National Vulnerability Database", "NVD", and "Apache"
        name?: Nullable<string>;
        // The url of the issue documentation as provided by the source
        url?: Nullable<string>;
    }

    export interface LicenseChoice {
        license?: Nullable<License>;
        expression?: Nullable<string>;
    }


    export interface License {
        // A valid SPDX license ID
        id?: Nullable<string>;
        // If SPDX does not define the license used, this field may be used to provide the license name
        name?: Nullable<string>;
        // Specifies the optional full text of the attachment
        text?: Nullable<AttachedText>;
        // The URL to the attachment file. If the attachment is a license or BOM, an externalReference should also be specified for completeness.
        url?: Nullable<string>;
        // An optional identifier which can be used to reference the license elsewhere in the BOM. Uniqueness is enforced within all elements and children of the root-level bom element.
        bom_ref?: Nullable<string>;
        // Licensing details describing the licensor/licensee, license type, renewal and expiration dates, and other important metadata
        licensing?: Nullable<Licensing>;
        // Specifies optional, custom, properties
        properties: Property[];
    }

    export interface Licensing {
        // License identifiers that may be used to manage licenses and their lifecycle
        altIds: string[];
        // The individual or organization that grants a license to another individual or organization
        licensor?: Nullable<OrganizationalEntityOrContact>;
        // The individual or organization for which a license was granted to
        licensee?: Nullable<OrganizationalEntityOrContact>;
        // The individual or organization that purchased the license
        purchaser?: Nullable<OrganizationalEntityOrContact>;
        // The purchase order identifier the purchaser sent to a supplier or vendor to authorize a purchase
        purchaseOrder?: Nullable<string>;
        // The type of license(s) that was granted to the licensee
        licenseTypes: LicensingTypeEnum[];
        // The timestamp indicating when the license was last renewed. For new purchases, this is often the purchase or acquisition date. For non-perpetual licenses or subscriptions, this is the timestamp of when the license was last renewed.
        lastRenewal: Nullable<Timestamp>;
        // The timestamp indicating when the current license expires (if applicable).
        expiration: Nullable<Timestamp>;
    }

    export interface OrganizationalEntityOrContact {
        organization?: Nullable<OrganizationalEntity>;
        individual?: Nullable<OrganizationalContact>;
    }

    export enum LicensingTypeEnum {
        LICENSING_TYPE_NULL,
        // A license that grants use of software solely for the purpose of education or research.
        LICENSING_TYPE_ACADEMIC,
        // A license covering use of software embedded in a specific piece of hardware.
        LICENSING_TYPE_APPLIANCE,
        // A Client Access License (CAL) allows client computers to access services provided by server software.
        LICENSING_TYPE_CLIENT_ACCESS,
        // A Concurrent User license (aka floating license) limits the number of licenses for a software application and licenses are shared among a larger number of users.
        LICENSING_TYPE_CONCURRENT_USER,
        // A license where the core of a computer's processor is assigned a specific number of points.
        LICENSING_TYPE_CORE_POINTS,
        // A license for which consumption is measured by non-standard metrics.
        LICENSING_TYPE_CUSTOM_METRIC,
        // A license that covers a defined number of installations on computers and other types of devices.
        LICENSING_TYPE_DEVICE,
        // A license that grants permission to install and use software for trial purposes.
        LICENSING_TYPE_EVALUATION,
        // A license that grants access to the software to one or more pre-defined users.
        LICENSING_TYPE_NAMED_USER,
        // A license that grants access to the software on one or more pre-defined computers or devices.
        LICENSING_TYPE_NODE_LOCKED,
        // An Original Equipment Manufacturer license that is delivered with hardware, cannot be transferred to other hardware, and is valid for the life of the hardware.
        LICENSING_TYPE_OEM,
        // A license where the software is sold on a one-time basis and the licensee can use a copy of the software indefinitely.
        LICENSING_TYPE_PERPETUAL,
        // A license where each installation consumes points per processor.
        LICENSING_TYPE_PROCESSOR_POINTS,
        // A license where the licensee pays a fee to use the software or service.
        LICENSING_TYPE_SUBSCRIPTION,
        // A license that grants access to the software or service by a specified number of users.
        LICENSING_TYPE_USER,
        // Another license type.
        LICENSING_TYPE_OTHER,
    }

    export interface Metadata {
        // The date and time (timestamp) when the document was created.
        timestamp: Nullable<Timestamp>;
        // The tool(s) used in the creation of the BOM.
        tools?: Nullable<Tool>;
        // The person(s) who created the BOM. Authors are common in BOMs created through manual processes. BOMs created through automated means may not have authors.
        authors: OrganizationalContact[];
        // The component that the BOM describes.
        component?: Nullable<Component>;
        // The organization that manufactured the component that the BOM describes.
        manufacture?: Nullable<OrganizationalEntity>;
        // The organization that supplied the component that the BOM describes. The supplier may often be the manufacture, but may also be a distributor or repackager.
        supplier?: Nullable<OrganizationalEntity>;
        // The license information for the BOM document
        licenses?: Nullable<LicenseChoice>;
        // Specifies optional, custom, properties
        properties: Property[];
        // The product lifecycle(s) that this BOM represents.
        lifecycles: Lifecycles[];
    }

    export interface Lifecycles {
        // A pre-defined phase in the product lifecycle.
        phase?: Nullable<LifecyclePhase>;
        // The name of the lifecycle phase
        name?: Nullable<string>;
        // The description of the lifecycle phase
        description: Nullable<string>;
    }

    export enum LifecyclePhase {
        // BOM produced early in the development lifecycle containing inventory of components and services that are proposed or planned to be used. The inventory may need to be procured, retrieved, or resourced prior to use.
        LIFECYCLE_PHASE_DESIGN,
        // BOM consisting of information obtained prior to a build process and may contain source files and development artifacts and manifests. The inventory may need to be resolved and retrieved prior to use.
        LIFECYCLE_PHASE_PRE_BUILD,
        // BOM consisting of information obtained during a build process where component inventory is available for use. The precise versions of resolved components are usually available at this time as well as the provenance of where the components were retrieved from.
        LIFECYCLE_PHASE_BUILD,
        // BOM consisting of information obtained after a build process has completed and the resulting components(s) are available for further analysis. Built components may exist as the result of a CI/CD process, may have been installed or deployed to a system or device, and may need to be retrieved or extracted from the system or device.
        LIFECYCLE_PHASE_POST_BUILD,
        // BOM produced that represents inventory that is running and operational. This may include staging or production environments and will generally encompass multiple SBOMs describing the applications and operating system, along with HBOMs describing the hardware that makes up the system. Operations Bill of Materials (OBOM) can provide full-stack inventory of runtime environments, configurations, and additional dependencies.
        LIFECYCLE_PHASE_OPERATIONS,
        // BOM consisting of information observed through network discovery providing point-in-time enumeration of embedded, on-premise, and cloud-native services such as server applications, connected devices, microservices, and serverless functions.
        LIFECYCLE_PHASE_DISCOVERY,
        // BOM containing inventory that will be, or has been retired from operations.
        LIFECYCLE_PHASE_DECOMMISSION,
    }

    export interface OrganizationalContact {
        // The name of the contact
        name?: Nullable<string>;
        // The email address of the contact.
        email?: Nullable<string>;
        // The phone number of the contact.
        phone?: Nullable<string>;
        // An optional identifier which can be used to reference the object elsewhere in the BOM. Uniqueness is enforced within all elements and children of the root-level bom element.
        bom_ref?: Nullable<string>;
    }

    export interface OrganizationalEntity {
        // The name of the organization
        name?: Nullable<string>;
        // The URL of the organization. Multiple URLs are allowed.
        url: string[];
        // A contact person at the organization. Multiple contacts are allowed.
        contact: OrganizationalContact[];
        // An optional identifier which can be used to reference the object elsewhere in the BOM. Uniqueness is enforced within all elements and children of the root-level bom element.
        bom_ref?: Nullable<string>;
    }

    export enum PatchClassification {
        PATCH_CLASSIFICATION_NULL,
        // A patch which is not developed by the creators or maintainers of the software being patched. Refer to https://en.wikipedia.org/wiki/Unofficial_patch
        PATCH_CLASSIFICATION_UNOFFICIAL,
        // A patch which dynamically modifies runtime behavior. Refer to https://en.wikipedia.org/wiki/Monkey_patch
        PATCH_CLASSIFICATION_MONKEY,
        // A patch which takes code from a newer version of software and applies it to older versions of the same software. Refer to https://en.wikipedia.org/wiki/Backporting
        PATCH_CLASSIFICATION_BACKPORT,
        // A patch created by selectively applying commits from other versions or branches of the same software.
        PATCH_CLASSIFICATION_CHERRY_PICK,
    }

    export interface Patch {
        // Specifies the purpose for the patch including the resolution of defects, security issues, or new behavior or functionality
        type: PatchClassification;
        // The patch file (or diff) that show changes. Refer to https://en.wikipedia.org/wiki/Diff
        diff?: Nullable<Diff>;
        resolves: Issue[];
    }

    // Component pedigree is a way to document complex supply chain scenarios where components are created, distributed, modified, redistributed, combined with other components, etc. Pedigree supports viewing this complex chain from the beginning, the end, or anywhere in the middle. It also provides a way to document variants where the exact relation may not be known.
    export interface Pedigree {
        // Describes zero or more components in which a component is derived from. This is commonly used to describe forks from existing projects where the forked version contains a ancestor node containing the original component it was forked from. For example, Component A is the original component. Component B is the component being used and documented in the BOM. However, Component B contains a pedigree node with a single ancestor documenting Component A - the original component from which Component B is derived from.
        ancestors: Component[];
        // Descendants are the exact opposite of ancestors. This provides a way to document all forks (and their forks) of an original or root component.
        descendants: Component[];
        // Variants describe relations where the relationship between the components are not known. For example, if Component A contains nearly identical code to Component B. They are both related, but it is unclear if one is derived from the other, or if they share a common ancestor.
        variants: Component[];
        // A list of zero or more commits which provide a trail describing how the component deviates from an ancestor, descendant, or variant.
        commits: Commit[];
        // A list of zero or more patches describing how the component deviates from an ancestor, descendant, or variant. Patches may be complimentary to commits or may be used in place of commits.
        patches: Patch[];
        // Notes, observations, and other non-structured commentary describing the components pedigree.
        notes?: Nullable<string>;
    }

    export enum Scope {
        // Default
        SCOPE_UNSPECIFIED,
        // The component is required for runtime
        SCOPE_REQUIRED,
        // The component is optional at runtime. Optional components are components that are not capable of being called due to them not be installed or otherwise accessible by any means. Components that are installed but due to configuration or other restrictions are prohibited from being called must be scoped as 'required'.
        SCOPE_OPTIONAL,
        // Components that are excluded provide the ability to document component usage for test and other non-runtime purposes. Excluded components are not reachable within a call graph at runtime.
        SCOPE_EXCLUDED,
    }

    export interface Service {
        // An optional identifier which can be used to reference the service elsewhere in the BOM. Uniqueness is enforced within all elements and children of the root-level bom element.
        bom_ref?: Nullable<string>;
        // The organization that provides the service.
        provider?: Nullable<OrganizationalEntity>;
        // The grouping name, namespace, or identifier. This will often be a shortened, single name of the company or project that produced the service or domain name. Whitespace and special characters should be avoided.
        group?: Nullable<string>;
        // The name of the service. This will often be a shortened, single name of the service.
        name: string;
        // The service version.
        version?: Nullable<string>;
        // Specifies a description for the service.
        description?: Nullable<string>;

        endpoints: string[];
        // A boolean value indicating if the service requires authentication. A value of true indicates the service requires authentication prior to use. A value of false indicates the service does not require authentication.
        authenticated?: Nullable<boolean>;
        // A boolean value indicating if use of the service crosses a trust zone or boundary. A value of true indicates that by using the service, a trust boundary is crossed. A value of false indicates that by using the service, a trust boundary is not crossed.
        x_trust_boundary?: Nullable<boolean>;
        data: DataFlow[];
        licenses: LicenseChoice[];
        // Provides the ability to document external references related to the service.
        external_references: ExternalReference[];
        // Specifies optional sub-service. This is not a dependency tree. It provides a way to specify a hierarchical representation of service assemblies, similar to system -> subsystem -> parts assembly in physical supply chains.
        services: Service[];
        // Specifies optional, custom, properties
        properties: Property[];
        // Specifies optional release notes.
        releaseNotes?: Nullable<ReleaseNotes>;
        // The name of the trust zone the service resides in.
        trustZone?: Nullable<string>;
    }

    export interface Swid {
        // Maps to the tagId of a SoftwareIdentity.
        tag_id: string;
        // Maps to the name of a SoftwareIdentity.
        name: string;
        // Maps to the version of a SoftwareIdentity.
        version?: Nullable<string>;
        // Maps to the tagVersion of a SoftwareIdentity.
        tag_version?: Nullable<number>;
        // Maps to the patch of a SoftwareIdentity.
        patch?: Nullable<boolean>;
        // Specifies the full content of the SWID tag.
        text?: Nullable<AttachedText>;
        // The URL to the SWID file.
        url?: Nullable<string>;
    }

    // Specifies a tool (manual or automated).
    export interface Tool {
        // A list of software and hardware components used as tools
        components: Component[];
        // A list of services used as tools. This may include microservices, function-as-a-service, and other types of network or intra-process services.
        services: Service[];
    }

    // Specifies a property
    export interface Property {
        name: string;
        value?: Nullable<string>;
    }

    export enum Aggregate {
        // The relationship completeness is not specified.
        AGGREGATE_NOT_SPECIFIED,
        // The relationship is complete. No further relationships including constituent components, services, or dependencies are known to exist.
        AGGREGATE_COMPLETE,
        // The relationship is incomplete. Additional relationships exist and may include constituent components, services, or dependencies.
        AGGREGATE_INCOMPLETE,
        // The relationship is incomplete. Only relationships for first-party components, services, or their dependencies are represented.
        AGGREGATE_INCOMPLETE_FIRST_PARTY_ONLY,
        // The relationship is incomplete. Only relationships for third-party components, services, or their dependencies are represented.
        AGGREGATE_INCOMPLETE_THIRD_PARTY_ONLY,
        // The relationship may be complete or incomplete. This usually signifies a 'best-effort' to obtain constituent components, services, or dependencies but the completeness is inconclusive.
        AGGREGATE_UNKNOWN,
        // The relationship is incomplete. Only relationships for first-party components, services, or their dependencies are represented, limited specifically to those that are proprietary.
        AGGREGATE_INCOMPLETE_FIRST_PARTY_PROPRIETARY_ONLY,
        // The relationship is incomplete. Only relationships for first-party components, services, or their dependencies are represented, limited specifically to those that are opensource.
        AGGREGATE_INCOMPLETE_FIRST_PARTY_OPENSOURCE_ONLY,
        // The relationship is incomplete. Only relationships for third-party components, services, or their dependencies are represented, limited specifically to those that are proprietary.
        AGGREGATE_INCOMPLETE_THIRD_PARTY_PROPRIETARY_ONLY,
        // The relationship is incomplete. Only relationships for third-party components, services, or their dependencies are represented, limited specifically to those that are opensource.
        AGGREGATE_INCOMPLETE_THIRD_PARTY_OPENSOURCE_ONLY,
    }

    export interface Composition {
        // Indicates the aggregate completeness
        aggregate: Aggregate;
        // The assemblies the aggregate completeness applies to
        assemblies: string[];
        // The dependencies the aggregate completeness applies to
        dependencies: string[];
        // The bom-ref identifiers of the vulnerabilities being described.
        vulnerabilities: string[];
        // An optional identifier which can be used to reference the composition elsewhere in the BOM. Every bom-ref MUST be unique within the BOM.
        bom_ref?: Nullable<string>;
    }

    export interface EvidenceCopyright {
        // Copyright text
        text: string;
    }

    export interface Evidence {
        licenses: LicenseChoice[];
        copyright: EvidenceCopyright[];
        identity: EvidenceIdentity[];
        occurrences: EvidenceOccurrences[];
        callstack?: Nullable<Callstack>;
    }

    export interface Frames {
        // A package organizes modules into namespaces, providing a unique namespace for each type it contains.
        package?: Nullable<string>;
        // A module or class that encloses functions/methods and other code.
        module: string;
        // A block of code designed to perform a particular task.
        function?: Nullable<string>;
        // Optional arguments that are passed to the module or function.
        parameters: string[];
        // The line number the code that is called resides on.
        line?: Nullable<number>;
        // The column the code that is called resides.
        column?: Nullable<number>;
        // The full path and filename of the module.
        fullFilename?: Nullable<string>;
    }

    // Evidence of the components use through the callstack.
    export interface Callstack {
        frames: Frames[];
    }

    export interface EvidenceIdentity {
        // The identity field of the component which the evidence describes.
        field: EvidenceFieldType;
        // The overall confidence of the evidence from 0 - 1, where 1 is 100% confidence.
        confidence?: Nullable<number>;
        // The methods used to extract and/or analyze the evidence.
        methods: EvidenceMethods[];
        // The object in the BOM identified by its bom-ref. This is often a component or service, but may be any object type supporting bom-refs. Tools used for analysis should already be defined in the BOM, either in the metadata/tools, components, or formulation.
        tools: string[];
    }

    export interface EvidenceMethods {
        // The technique used in this method of analysis.
        technique: EvidenceTechnique;
        // The confidence of the evidence from 0 - 1, where 1 is 100% confidence. Confidence is specific to the technique used. Each technique of analysis can have independent confidence.
        confidence: number;
        // The value or contents of the evidence.
        value?: Nullable<string>;
    }

    export interface EvidenceOccurrences {
        // An optional identifier which can be used to reference the occurrence elsewhere in the BOM. Every bom-ref MUST be unique within the BOM.
        bom_ref?: Nullable<string>;
        // The location or path to where the component was found.
        location: string;
    }

    export enum EvidenceFieldType {
        EVIDENCE_FIELD_NULL,
        EVIDENCE_FIELD_GROUP,
        EVIDENCE_FIELD_NAME,
        EVIDENCE_FIELD_VERSION,
        EVIDENCE_FIELD_PURL,
        EVIDENCE_FIELD_CPE,
        EVIDENCE_FIELD_SWID,
        EVIDENCE_FIELD_HASH,
    }

    export enum EvidenceTechnique {
        EVIDENCE_TECHNIQUE_SOURCE_CODE_ANALYSIS,
        EVIDENCE_TECHNIQUE_BINARY_ANALYSIS,
        EVIDENCE_TECHNIQUE_MANIFEST_ANALYSIS,
        EVIDENCE_TECHNIQUE_AST_FINGERPRINT,
        EVIDENCE_TECHNIQUE_HASH_COMPARISON,
        EVIDENCE_TECHNIQUE_INSTRUMENTATION,
        EVIDENCE_TECHNIQUE_DYNAMIC_ANALYSIS,
        EVIDENCE_TECHNIQUE_FILENAME,
        EVIDENCE_TECHNIQUE_ATTESTATION,
        EVIDENCE_TECHNIQUE_OTHER,
    }

    export interface Note {
        // The ISO-639 (or higher) language code and optional ISO-3166 (or higher) country code. Examples include: "en", "en-US", "fr" and "fr-CA".
        locale?: Nullable<string>;
        // Specifies the full content of the release note.
        text?: Nullable<AttachedText>;
    }

    export interface ReleaseNotes {
        // The software versioning type. It is RECOMMENDED that the release type use one of 'major', 'minor', 'patch', 'pre-release', or 'internal'. Representing all possible software release types is not practical, so standardizing on the recommended values, whenever possible, is strongly encouraged.
        type: string;
        // The title of the release.
        title?: Nullable<string>;
        // The URL to an image that may be prominently displayed with the release note.
        featuredImage?: Nullable<string>;
        // The URL to an image that may be used in messaging on social media platforms.
        socialImage?: Nullable<string>;
        // A short description of the release.
        description?: Nullable<string>;
        // The date and time (timestamp) when the release note was created.
        timestamp?: Nullable<Timestamp>;
        // Optional alternate names the release may be referred to. This may include unofficial terms used by development and marketing teams (e.g. code names).
        aliases: string[];
        // Optional tags that may aid in search or retrieval of the release note.
        tags: string[];
        // A collection of issues that have been resolved.
        resolves: Issue[];
        // Zero or more release notes containing the locale and content. Multiple note messages may be specified to support release notes in a wide variety of languages.
        notes: Note[];
        // Specifies optional, custom, properties
        properties: Property[];
    }

    export interface Vulnerability {
        // An optional identifier which can be used to reference the vulnerability elsewhere in the BOM. Uniqueness is enforced within all elements and children of the root-level bom element.
        bom_ref?: Nullable<string>;
        // The identifier that uniquely identifies the vulnerability.
        id?: Nullable<string>;
        // The source that published the vulnerability.
        source?: Nullable<Source>;
        // Zero or more pointers to vulnerabilities that are the equivalent of the vulnerability specified. Often times, the same vulnerability may exist in multiple sources of vulnerability intelligence, but have different identifiers. References provide a way to correlate vulnerabilities across multiple sources of vulnerability intelligence.
        references: VulnerabilityReference[];
        // List of vulnerability ratings
        ratings: VulnerabilityRating[];
        // List of Common Weaknesses Enumerations (CWEs) codes that describes this vulnerability. For example 399 (of https://cwe.mitre.org/data/definitions/399.html)
        cwes: number[];
        // A description of the vulnerability as provided by the source.
        description?: Nullable<string>;
        // If available, an in-depth description of the vulnerability as provided by the source organization. Details often include information useful in understanding root cause.
        detail?: Nullable<string>;
        // Recommendations of how the vulnerability can be remediated or mitigated.
        recommendation?: Nullable<string>;
        // Published advisories of the vulnerability if provided.
        advisories: Advisory[];
        // The date and time (timestamp) when the vulnerability record was created in the vulnerability database.
        created: Nullable<Timestamp>;
        // The date and time (timestamp) when the vulnerability record was first published.
        published: Nullable<Timestamp>;
        // The date and time (timestamp) when the vulnerability record was last updated.
        updated: Nullable<Timestamp>;
        // Individuals or organizations credited with the discovery of the vulnerability.
        credits?: Nullable<VulnerabilityCredits>;
        // The tool(s) used to identify, confirm, or score the vulnerability.
        tools?: Nullable<Tool>;
        // An assessment of the impact and exploitability of the vulnerability.
        analysis?: Nullable<VulnerabilityAnalysis>;
        // affects
        affects: VulnerabilityAffects[];
        // Specifies optional, custom, properties
        properties: Property[];
        // The date and time (timestamp) when the vulnerability record was rejected (if applicable).
        rejected: Nullable<Timestamp>;
        // Evidence used to reproduce the vulnerability.
        proofOfConcept?: Nullable<ProofOfConcept>;
        // A bypass, usually temporary, of the vulnerability that reduces its likelihood and/or impact. Workarounds often involve changes to configuration or deployments.
        workaround?: Nullable<string>;
    }

    export interface ProofOfConcept {
        // Precise steps to reproduce the vulnerability.
        reproductionSteps?: Nullable<string>;
        // A description of the environment in which reproduction was possible.
        environment?: Nullable<string>;
        // Supporting material that helps in reproducing or understanding how reproduction is possible. This may include screenshots, payloads, and PoC exploit code.
        supportingMaterial: AttachedText[];
    }

    export interface VulnerabilityReference {
        // An identifier that uniquely identifies the vulnerability.
        id: string;
        // The source that published the vulnerability.
        source?: Nullable<Source>;
    }

    export interface VulnerabilityRating {
        // The source that calculated the severity or risk rating of the vulnerability.
        source?: Nullable<Source>;
        // The numerical score of the rating.
        score?: Nullable<number>;
        // Textual representation of the severity that corresponds to the numerical score of the rating.
        severity?: Nullable<Severity>;
        // Specifies the severity or risk scoring methodology or standard used.
        method?: Nullable<ScoreMethod>;
        // Textual representation of the metric values used to score the vulnerability.
        vector?: Nullable<string>;
        // An optional reason for rating the vulnerability as it was.
        justification?: Nullable<string>;
    }

    export enum Severity {
        SEVERITY_UNKNOWN,
        SEVERITY_CRITICAL,
        SEVERITY_HIGH,
        SEVERITY_MEDIUM,
        SEVERITY_LOW,
        SEVERITY_INFO,
        SEVERITY_NONE,
    }

    export enum ScoreMethod {
        // An undefined score method
        SCORE_METHOD_NULL,
        // Common Vulnerability Scoring System v2 - https://www.first.org/cvss/v2/
        SCORE_METHOD_CVSSV2,
        // Common Vulnerability Scoring System v3 - https://www.first.org/cvss/v3-0/
        SCORE_METHOD_CVSSV3,
        // Common Vulnerability Scoring System v3.1 - https://www.first.org/cvss/v3-1/
        SCORE_METHOD_CVSSV31,
        // OWASP Risk Rating Methodology - https://owasp.org/www-community/OWASP_Risk_Rating_Methodology
        SCORE_METHOD_OWASP,
        // Other scoring method
        SCORE_METHOD_OTHER,
        // Common Vulnerability Scoring System v3.1 - https://www.first.org/cvss/v4-0/
        SCORE_METHOD_CVSSV4,
        // Stakeholder Specific Vulnerability Categorization (all versions) - https://github.com/CERTCC/SSVC
        SCORE_METHOD_SSVC,
    }

    export interface Advisory {
        // An optional name of the advisory.
        title?: Nullable<string>;
        // Location where the advisory can be obtained.
        url: string;
    }

    export interface VulnerabilityCredits {
        // The organizations credited with vulnerability discovery.
        organizations: OrganizationalEntity[];
        // The individuals, not associated with organizations, that are credited with vulnerability discovery.
        individuals: OrganizationalContact[];
    }

    export interface VulnerabilityAnalysis {
        // Declares the current state of an occurrence of a vulnerability, after automated or manual analysis.
        state?: Nullable<ImpactAnalysisState>;
        // The rationale of why the impact analysis state was asserted.
        justification?: Nullable<ImpactAnalysisJustification>;
        // A response to the vulnerability by the manufacturer, supplier, or project responsible for the affected component or service. More than one response is allowed. Responses are strongly encouraged for vulnerabilities where the analysis state is exploitable.
        response: VulnerabilityResponse[];
        // Detailed description of the impact including methods used during assessment. If a vulnerability is not exploitable, this field should include specific details on why the component or service is not impacted by this vulnerability.
        detail?: Nullable<string>;
        // The date and time (timestamp) when the analysis was first issued.
        firstIssued: Nullable<Timestamp>;
        // The date and time (timestamp) when the analysis was last updated.
        lastUpdated: Nullable<Timestamp>;
    }

    export enum ImpactAnalysisState {
        // An undefined impact analysis state
        IMPACT_ANALYSIS_STATE_NULL,
        // The vulnerability has been remediated.
        IMPACT_ANALYSIS_STATE_RESOLVED,
        // The vulnerability has been remediated and evidence of the changes are provided in the affected components pedigree containing verifiable commit history and/or diff(s).
        IMPACT_ANALYSIS_STATE_RESOLVED_WITH_PEDIGREE,
        // The vulnerability may be directly or indirectly exploitable.
        IMPACT_ANALYSIS_STATE_EXPLOITABLE,
        // The vulnerability is being investigated.
        IMPACT_ANALYSIS_STATE_IN_TRIAGE,
        // The vulnerability is not specific to the component or service and was falsely identified or associated.
        IMPACT_ANALYSIS_STATE_FALSE_POSITIVE,
        // The component or service is not affected by the vulnerability. Justification should be specified for all not_affected cases.
        IMPACT_ANALYSIS_STATE_NOT_AFFECTED,
    }

    export enum ImpactAnalysisJustification {
        // An undefined impact analysis justification
        IMPACT_ANALYSIS_JUSTIFICATION_NULL,
        // The code has been removed or tree-shaked.
        IMPACT_ANALYSIS_JUSTIFICATION_CODE_NOT_PRESENT,
        // The vulnerable code is not invoked at runtime.
        IMPACT_ANALYSIS_JUSTIFICATION_CODE_NOT_REACHABLE,
        // Exploitability requires a configurable option to be set/unset.
        IMPACT_ANALYSIS_JUSTIFICATION_REQUIRES_CONFIGURATION,
        // Exploitability requires a dependency that is not present.
        IMPACT_ANALYSIS_JUSTIFICATION_REQUIRES_DEPENDENCY,
        // Exploitability requires a certain environment which is not present.
        IMPACT_ANALYSIS_JUSTIFICATION_REQUIRES_ENVIRONMENT,
        // Exploitability requires a compiler flag to be set/unset.
        IMPACT_ANALYSIS_JUSTIFICATION_PROTECTED_BY_COMPILER,
        // Exploits are prevented at runtime.
        IMPACT_ANALYSIS_JUSTIFICATION_PROTECTED_AT_RUNTIME,
        // Attacks are blocked at physical, logical, or network perimeter.
        IMPACT_ANALYSIS_JUSTIFICATION_PROTECTED_AT_PERIMETER,
        // Preventative measures have been implemented that reduce the likelihood and/or impact of the vulnerability.
        IMPACT_ANALYSIS_JUSTIFICATION_PROTECTED_BY_MITIGATING_CONTROL,
    }

    export enum VulnerabilityResponse {
        VULNERABILITY_RESPONSE_NULL,
        VULNERABILITY_RESPONSE_CAN_NOT_FIX,
        VULNERABILITY_RESPONSE_WILL_NOT_FIX,
        VULNERABILITY_RESPONSE_UPDATE,
        VULNERABILITY_RESPONSE_ROLLBACK,
        VULNERABILITY_RESPONSE_WORKAROUND_AVAILABLE,
    }

    export interface VulnerabilityAffects {
        // References a component or service by the objects bom-ref
        ref: string;
        // Zero or more individual versions or range of versions.
        versions: VulnerabilityAffectedVersions[];
    }

    export interface VulnerabilityAffectedVersions {
        // A single version of a component or service.
        version?: Nullable<string>;
        // A version range specified in Package URL Version Range syntax (vers) which is defined at https://github.com/package-url/purl-spec/VERSION-RANGE-SPEC.rst
        range?: Nullable<string>;
        // The vulnerability status for the version or range of versions.
        status?: Nullable<VulnerabilityAffectedStatus>;
    }

    export enum VulnerabilityAffectedStatus {
        // The vulnerability status of a given version or range of versions of a product. The statuses 'affected' and 'unaffected' indicate that the version is affected or unaffected by the vulnerability. The status 'unknown' indicates that it is unknown or unspecified whether the given version is affected. There can be many reasons for an 'unknown' status, including that an investigation has not been undertaken or that a vendor has not disclosed the status.
        VULNERABILITY_AFFECTED_STATUS_UNKNOWN,
        VULNERABILITY_AFFECTED_STATUS_AFFECTED,
        VULNERABILITY_AFFECTED_STATUS_NOT_AFFECTED
    }

    export interface AnnotatorChoice {
        // The organization that created the annotation
        organization?: Nullable<OrganizationalEntity>;
        // The person that created the annotation
        individual?: Nullable<OrganizationalContact>;
        // The tool or component that created the annotation
        component?: Nullable<Component>;
        // The service that created the annotation
        service?: Nullable<Service>;
    }

    export interface Annotation {
        // An optional identifier which can be used to reference the annotation elsewhere in the BOM. Every bom-ref MUST be unique within the BOM.
        bom_ref?: Nullable<string>;
        // The object in the BOM identified by its bom-ref. This is often a component or service, but may be any object type supporting bom-refs.
        subjects: string[];
        // The organization, person, component, or service which created the textual content of the annotation.
        annotator?: Nullable<AnnotatorChoice>;
        // The date and time (timestamp) when the annotation was created.
        timestamp?: Nullable<Timestamp>;
        // The textual content of the annotation.
        text: string;
    }

    export interface Approach {
        type?: Nullable<ModelParameterApproachType>;
    }

    export interface Datasets {
        dataset?: Nullable<ComponentData>;
        // References a data component by the components bom-ref attribute
        ref: string;
    }

    export interface MachineLearningInputOutputParameters {
        // The data format for input/output to the model. Example formats include string, image, time-series
        format?: Nullable<string>;
    }

    export interface ModelParameters {
        // The overall approach to learning used by the model for problem solving.
        approach?: Nullable<Approach>;
        // Directly influences the input and/or output. Examples include classification, regression, clustering, etc.
        task?: Nullable<string>;
        // The model architecture family such as transformer network, convolutional neural network, residual neural network, LSTM neural network, etc.
        architectureFamily?: Nullable<string>;
        //The specific architecture of the model such as GPT-1, ResNet-50, YOLOv3, etc.
        modelArchitecture?: Nullable<string>;
        // The datasets used to train and evaluate the model.
        datasets: Datasets[];
        // The input format(s) of the model
        inputs: MachineLearningInputOutputParameters[];
        // The output format(s) from the model
        outputs: MachineLearningInputOutputParameters[];
    }

    export interface ConfidenceInterval {
        // The lower bound of the confidence interval.
        lowerBound?: Nullable<string>;
        // The upper bound of the confidence interval.
        upperBound?: Nullable<string>;
    }

    export interface PerformanceMetrics {
        // The type of performance metric.
        type?: Nullable<string>;
        // The value of the performance metric.
        value?: Nullable<string>;
        // The name of the slice this metric was computed on. By default, assume this metric is not sliced.
        slice?: Nullable<string>;
        // The confidence interval of the metric.
        confidenceInterval?: Nullable<ConfidenceInterval>;
    }

    export interface QuantitativeAnalysis {
        // The model performance metrics being reported. Examples may include accuracy, F1 score, precision, top-3 error rates, MSC, etc.
        performanceMetrics: PerformanceMetrics[];
        graphics?: Nullable<GraphicsCollection>;
    }

    export interface ModelCardConsiderations {
        // Who are the intended users of the model?
        users: string[];
        // What are the intended use cases of the model?
        useCases: string[];
        // What are the known technical limitations of the model? E.g. What kind(s) of data should the model be expected not to perform well on? What are the factors that might degrade model performance?
        technicalLimitations: string[];
        // What are the known tradeoffs in accuracy/performance of the model?
        performanceTradeoffs: string[];
        // What are the ethical (or environmental) risks involved in the application of this model?
        ethicalConsiderations: EthicalConsiderations[];
        // How does the model affect groups at risk of being systematically disadvantaged? What are the harms and benefits to the various affected groups?
        fairnessAssessments: FairnessAssessments[];
    }

    export interface EthicalConsiderations {
        // The name of the risk.
        name?: Nullable<string>;
        // Strategy used to address this risk.
        mitigationStrategy?: Nullable<string>;
    }

    export interface FairnessAssessments {
        // The groups or individuals at risk of being systematically disadvantaged by the model.
        groupAtRisk?: Nullable<string>;
        // Expected benefits to the identified groups.
        benefits?: Nullable<string>;
        // Expected harms to the identified groups.
        harms?: Nullable<string>;
        // With respect to the benefits and harms outlined, please describe any mitigation strategy implemented.
        mitigationStrategy?: Nullable<string>;
    }

    export interface ModelCard {
        // An optional identifier which can be used to reference the model card elsewhere in the BOM. Every bom-ref MUST be unique within the BOM.
        bom_ref?: Nullable<string>;
        // Hyper-parameters for construction of the model.
        modelParameters?: Nullable<ModelParameters>;
        // A quantitative analysis of the model
        quantitativeAnalysis?: Nullable<QuantitativeAnalysis>;
        // What considerations should be taken into account regarding the model's construction, training, and application?
        considerations?: Nullable<ModelCardConsiderations>;


    }

    export enum ModelParameterApproachType {
        MODEL_PARAMETER_APPROACH_TYPE_SUPERVISED,
        MODEL_PARAMETER_APPROACH_TYPE_UNSUPERVISED,
        MODEL_PARAMETER_APPROACH_TYPE_REINFORCED_LEARNING,
        MODEL_PARAMETER_APPROACH_TYPE_SEMI_SUPERVISED,
        MODEL_PARAMETER_APPROACH_TYPE_SELF_SUPERVISED,
    }

    export interface ComponentDataContents {
        // An optional way to include textual or encoded data.
        attachment?: Nullable<AttachedText>;
        // The URL to where the data can be retrieved.
        url?: Nullable<string>;
        // Provides the ability to document name-value parameters used for configuration.
        properties: Property[];
    }

    export interface ComponentData {
        // An optional identifier which can be used to reference the dataset elsewhere in the BOM. Every bom-ref MUST be unique within the BOM.
        bom_ref?: Nullable<string>;
        // The general theme or subject matter of the data being specified.
        type?: Nullable<ComponentDataType>;
        // The name of the dataset.
        name?: Nullable<string>;
        // The contents or references to the contents of the data being described.
        contents?: Nullable<ComponentDataContents>;
        // Data classification tags data according to its type, sensitivity, and value if altered, stolen, or destroyed.
        classification?: Nullable<string>;
        // A description of any sensitive data in a dataset.
        sensitiveData: string[];
        // A collection of graphics that represent various measurements.
        graphics?: Nullable<GraphicsCollection>;
        // A description of the dataset. Can describe size of dataset, whether it's used for source code, training, testing, or validation, etc.
        description?: Nullable<string>;
        // Data Governance
        governance?: Nullable<DataGovernance>;
    }

    export interface DataGovernanceResponsibleParty {
        organization?: Nullable<OrganizationalEntity>;
        contact?: Nullable<OrganizationalContact>;
    }

    export interface DataGovernance {
        // Data custodians are responsible for the safe custody, transport, and storage of data.
        custodians: DataGovernanceResponsibleParty[];
        // Data stewards are responsible for data content, context, and associated business rules.
        stewards: DataGovernanceResponsibleParty[];
        // Data owners are concerned with risk and appropriate access to data.
        owners: DataGovernanceResponsibleParty[];
    }

    export enum ComponentDataType {
        // Any type of code, code snippet, or data-as-code
        COMPONENT_DATA_TYPE_SOURCE_CODE,
        // Parameters or settings that may be used by other components.
        COMPONENT_DATA_TYPE_CONFIGURATION,
        // A collection of data.
        COMPONENT_DATA_TYPE_DATASET,
        // Data that can be used to create new instances of what the definition defines.
        COMPONENT_DATA_TYPE_DEFINITION,
        // Any other type of data that does not fit into existing definitions.
        COMPONENT_DATA_TYPE_OTHER,
    }

    export interface Graphic {
        // The name of the graphic.
        name?: Nullable<string>;
        // The graphic (vector or raster). Base64 encoding MUST be specified for binary images.
        image?: Nullable<AttachedText>;
    }

    export interface GraphicsCollection {
        // A description of this collection of graphics.
        description?: Nullable<string>;
        // A collection of graphics.
        graphic: Graphic[];
    }

    // Describes workflows and resources that captures rules and other aspects of how the associated BOM component or service was formed.
    export interface Formula {
        // BOM unique reference to the resource.
        bom_ref?: Nullable<string>;
        // Transient components that are used in tasks that constitute one or more of this formula's workflows
        components: Component[];
        // Transient services that are used in tasks that constitute one or more of this formula's workflows
        services: Service[];
        // List of workflows that can be declared to accomplish specific orchestrated goals and independently triggered.
        workflows: Workflow[];
        // Domain-specific formula properties.
        properties: Property[];
    }

    // A specialized orchestration task.
    export interface Workflow {
        // BOM unique reference to the resource.
        bom_ref: string;
        // The unique identifier for the resource instance within its deployment context.
        uid: string;
        // The name of the resource instance.
        name?: Nullable<string>;
        // A description of the resource instance.
        description?: Nullable<string>;
        // Domain-specific resource instance properties.
        properties: Property[];
        // References to component or service resources that are used to realize the resource instance.
        resourceReferences: ResourceReferenceChoice[];
        // The tasks that comprise the workflow.
        tasks: Task[];
        // The graph of dependencies between tasks within the workflow.
        taskDependencies: Dependency[];
        // Indicates the types of activities performed by the set of workflow tasks.
        taskTypes: TaskType[];
        // The trigger that initiated the task.
        trigger?: Nullable<Trigger>;
        // The sequence of steps for the task.
        steps: Step[];
        // Represents resources and data brought into a task at runtime by executor or task commands
        inputs: InputType[];
        // Represents resources and data output from a task at runtime by executor or task commands
        outputs: OutputType[];
        // The date and time (timestamp) when the task started.
        timeStart: Nullable<Timestamp>;
        // The date and time (timestamp) when the task ended.
        timeEnd: Nullable<Timestamp>;
        // A set of named filesystem or data resource shareable by workflow tasks.
        workspaces: Workspace[];
        // A graph of the component runtime topology for workflow's instance.
        runtimeTopology: Dependency[];
    }

    // Describes the inputs, sequence of steps and resources used to accomplish a task and its output.
    export interface Task {
        // BOM unique reference to the resource.
        bom_ref: string;
        // The unique identifier for the resource instance within its deployment context.
        uid: string;
        // The name of the resource instance.
        name?: Nullable<string>;
        // A description of the resource instance.
        description?: Nullable<string>;
        // Domain-specific task instance properties.
        properties: Property[];
        // References to component or service resources that are used to realize the resource instance.
        resourceReferences: ResourceReferenceChoice[];
        // Indicates the types of activities performed by the set of workflow tasks.
        taskTypes: TaskType[];
        // The trigger that initiated the task.
        trigger?: Nullable<Trigger>;
        // "The sequence of steps for the task.
        steps: Step[];
        // Represents resources and data brought into a task at runtime by executor or task commands
        inputs: InputType[];
        // Represents resources and data output from a task at runtime by executor or task commands
        outputs: OutputType[];
        // The date and time (timestamp) when the task started.
        timeStart: Nullable<Timestamp>;
        // The date and time (timestamp) when the task ended.
        timeEnd: Nullable<Timestamp>;
        // A set of named filesystem or data resource shareable by workflow tasks.
        workspaces: Workspace[];
        // A graph of the component runtime topology for task's instance.
        runtimeTopology: Dependency[];
    }

    // Executes specific commands or tools in order to accomplish its owning task as part of a sequence.
    export interface Step {
        // A name for the step.
        name?: Nullable<string>;
        // A description of the step.
        description?: Nullable<string>;
        // Ordered list of commands or directives for the step
        commands: Command[];
        // Domain-specific step properties.
        properties: Property[];
    }

    export interface Command {
        // A text representation of the executed command.
        executed?: Nullable<string>;
        // Domain-specific command properties.
        properties: Property[];
    }

    export enum AccessMode {
        ACCESS_MODE_READ_ONLY,
        ACCESS_MODE_READ_WRITE,
        ACCESS_MODE_READ_WRITE_ONCE,
        ACCESS_MODE_WRITE_ONCE,
        ACCESS_MODE_WRITE_ONLY,
    }

    // A named filesystem or data resource shareable by workflow tasks.
    export interface Workspace {
        // BOM unique reference to the resource.
        bom_ref: string;
        // The unique identifier for the resource instance within its deployment context.
        uid: string;
        // The name of the resource instance.
        name?: Nullable<string>;
        // The names for the workspace as referenced by other workflow tasks. Effectively, a name mapping so other tasks can use their own local name in their steps.
        aliases: string[];
        // A description of the resource instance.
        description?: Nullable<string>;
        // Domain-specific workspace instance properties.
        properties: Property[];
        // References to component or service resources that are used to realize the resource instance.
        resourceReferences: ResourceReferenceChoice[];
        // Describes the read-write access control for the workspace relative to the owning resource instance.
        accessMode?: Nullable<AccessMode>;
        // A path to a location on disk where the workspace will be available to the associated task's steps.
        mountPath?: Nullable<string>;
        // The name of a domain-specific data type the workspace represents.
        managedDataType?: Nullable<string>;
        // Identifies the reference to the request for a specific volume type and parameters.
        volumeRequest?: Nullable<string>;
        // Information about the actual volume instance allocated to the workspace.
        volume?: Nullable<Volume>;
    }

    export enum VolumeMode {
        VOLUME_MODE_FILESYSTEM,
        VOLUME_MODE_BLOCK,
    }

    // An identifiable, logical unit of data storage tied to a physical device.
    export interface Volume {
        // The unique identifier for the volume instance within its deployment context.
        uid?: Nullable<string>;
        // The name of the volume instance
        name?: Nullable<string>;
        // The volume mode for the volume instance.
        mode?: Nullable<VolumeMode>;
        // The underlying path created from the actual volume.
        path?: Nullable<string>;
        // The allocated size of the volume accessible to the associated workspace. This should include the scalar size as well as IEC standard unit in either decimal or binary form.
        sizeAllocated?: Nullable<string>;
        // Indicates if the volume persists beyond the life of the resource it is associated with.
        persistent?: Nullable<boolean>;
        // Indicates if the volume is remotely (i.e., network) attached.
        remote?: Nullable<boolean>;
        // Domain-specific volume instance properties.
        properties: Property[];


    }

    export enum TriggerType {
        TRIGGER_TYPE_MANUAL,
        TRIGGER_TYPE_API,
        TRIGGER_TYPE_WEBHOOK,
        TRIGGER_TYPE_SCHEDULED
    }

    // Represents a resource that can conditionally activate (or fire) tasks based upon associated events and their data.
    export interface Trigger {
        // BOM unique reference to the resource.
        bom_ref: string;
        // The unique identifier for the resource instance within its deployment context.
        uid: string;
        // The name of the resource instance.
        name?: Nullable<string>;
        // A description of the resource instance.
        description?: Nullable<string>;
        // Additional properties of the trigger.
        properties: Property[];
        // References to component or service resources that are used to realize the resource instance.
        resourceReferences: ResourceReferenceChoice[];
        // The source type of event which caused the trigger to fire.
        type?: Nullable<TriggerType>;
        // The event data that caused the associated trigger to activate.
        event?: Nullable<Event>;
        // Conditions
        conditions: Condition[];
        // The date and time (timestamp) when the trigger was activated.
        timeActivated: Nullable<Timestamp>;
        // Represents resources and data brought into a task at runtime by executor or task commands
        inputs: InputType[];
        // Represents resources and data output from a task at runtime by executor or task commands
        outputs: OutputType[];


    }

    // Represents something that happened that may trigger a response.
    export interface Event {
        // The unique identifier of the event.
        uid?: Nullable<string>;
        // A description of the event.
        description?: Nullable<string>;
        // The date and time (timestamp) when the event was received.
        timeReceived: Nullable<Timestamp>;
        // Encoding of the raw event data.
        data?: Nullable<AttachedText>;
        // References the component or service that was the source of the event
        source?: Nullable<ResourceReferenceChoice>;
        // References the component or service that was the target of the event
        target?: Nullable<ResourceReferenceChoice>;
        // Additional properties of the event.
        properties: Property[];
    }

    // Type that represents various input data types and formats.
    export interface InputType {
        // A references to the component or service that provided the input to the task (e.g., reference to a service with data flow value of `inbound`)
        source?: Nullable<ResourceReferenceChoice>;
        // A reference to the component or service that received or stored the input if not the task itself (e.g., a local, named storage workspace)
        target?: Nullable<ResourceReferenceChoice>;
        // A reference to an independent resource provided as an input to a task by the workflow runtime.
        resource?: Nullable<ResourceReferenceChoice>;
        // Inputs that have the form of parameters with names and values.
        parameters: Parameter[];
        // Inputs that have the form of parameters with names and values.
        environmentVars: EnvironmentVars[];
        // Inputs that have the form of data.
        data?: Nullable<AttachedText>;
        // Additional properties of the input data.
        properties: Property[];
    }

    export enum OutputTypeType {
        OUTPUT_TYPE_ARTIFACT,
        OUTPUT_TYPE_ATTESTATION,
        OUTPUT_TYPE_LOG,
        OUTPUT_TYPE_EVIDENCE,
        OUTPUT_TYPE_METRICS,
        OUTPUT_TYPE_OTHER,
    }

    export interface OutputType {
        // Describes the type of data output.
        type?: Nullable<OutputTypeType>;
        // Component or service that generated or provided the output from the task (e.g., a build tool)
        source?: Nullable<ResourceReferenceChoice>;
        // Component or service that received the output from the task (e.g., reference to an artifactory service with data flow value of `outbound`)
        target?: Nullable<ResourceReferenceChoice>;
        // A reference to an independent resource generated as output by the task.
        resource?: Nullable<ResourceReferenceChoice>;
        // Outputs that have the form of data.
        data?: Nullable<AttachedText>;
        // Outputs that have the form of environment variables.
        environmentVars: EnvironmentVars[];
        // Additional properties of the output data.
        properties: Property[];


    }

    export interface ResourceReferenceChoice {
        ref?: Nullable<string>;
        externalReference?: Nullable<ExternalReference>;
    }

    // A condition that was used to determine a trigger should be activated.
    export interface Condition {
        // Describes the set of conditions which cause the trigger to activate.
        description?: Nullable<string>;
        // The logical expression that was evaluated that determined the trigger should be fired.
        expression?: Nullable<string>;
        // Domain-specific condition instance properties.
        properties: Property[];
    }

    export enum TaskType {
        TASK_TYPE_COPY,
        TASK_TYPE_CLONE,
        TASK_TYPE_LINT,
        TASK_TYPE_SCAN,
        TASK_TYPE_MERGE,
        TASK_TYPE_BUILD,
        TASK_TYPE_TEST,
        TASK_TYPE_DELIVER,
        TASK_TYPE_DEPLOY,
        TASK_TYPE_RELEASE,
        TASK_TYPE_CLEAN,
        TASK_TYPE_OTHER
    }

    // A representation of a functional parameter.
    export interface Parameter {
        // The name of the parameter.
        name?: Nullable<string>;
        // The value of the parameter.
        value?: Nullable<string>;
        // The data type of the parameter.
        dataType?: Nullable<string>;
    }

    export interface EnvironmentVars {
        property?: Nullable<Property>;
        value?: Nullable<string>;
    }
}