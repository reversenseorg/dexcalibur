import {UserRole} from "./rbac/UserRole.js";
import {AccessFactory} from "./AccessFactory.js";
import {ProjectAccessControl} from "./rbac/ProjectAccessContol.js";
import {AccessProperty, AccessType} from "./Access.js";
import {SettingsAccessControl} from "./rbac/SettingsAccessContol.js";
import {GlobalAccessControl} from "./rbac/GlobalAccessContol.js";

export const BUILT_IN_ROLES = [
    new UserRole(  'local_admin', 'Local Admin', AccessFactory.union(
        ProjectAccessControl.getMatchingAccesses( AccessProperty.UID, '.'),
        SettingsAccessControl.getMatchingAccesses( AccessProperty.UID, '.'),
        GlobalAccessControl.getMatchingAccesses( AccessProperty.UID, '.'),
        //SettingsAccessControl.getMatchingAccesses( AccessProperty.TYPE, AccessType.READ),
        //SettingsAccessControl.getMatchingAccesses( AccessProperty.TYPE, AccessType.WRITE)
    )),
    new UserRole(  'user', 'User', AccessFactory.union(
        ProjectAccessControl.getMatchingAccesses( AccessProperty.UID, '.')
    )),
];

export const BUILT_IN_DEFAULT_ROLE = 'local_admin';