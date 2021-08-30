import {UserRole} from "./rbac/UserRole";
import {AccessFactory} from "./AccessFactory";
import {ProjectAccessControl} from "./rbac/ProjectAccessContol";
import {AccessProperty, AccessType} from "./Access";
import {SettingsAccessControl} from "./rbac/SettingsAccessContol";

export const BUILT_IN_ROLES = [
    new UserRole(  'local_admin', 'Local Admin', AccessFactory.union(
        ProjectAccessControl.getMatchingAccesses( AccessProperty.UID, '.'),
        SettingsAccessControl.getMatchingAccesses( AccessProperty.UID, '.'),
        //SettingsAccessControl.getMatchingAccesses( AccessProperty.TYPE, AccessType.READ),
        //SettingsAccessControl.getMatchingAccesses( AccessProperty.TYPE, AccessType.WRITE)
    )),
    new UserRole(  'user', 'User', AccessFactory.union(
        ProjectAccessControl.getMatchingAccesses( AccessProperty.UID, '.')
    )),
];

export const BUILT_IN_DEFAULT_ROLE = 'local_admin';