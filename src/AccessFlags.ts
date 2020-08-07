
export const enum Modifier {
     PUBLIC = 0b1,
     PROTECTED = 0b10,
     STATIC = 0b10 << 1,
     ABSTRACT = 0b10 << 2,
     CONSTRUCT = 0b10 << 3,
     FINAL = 0b10 << 4,
     TRANS = 0b10 << 5,
     NATIVE = 0b10 << 6,
     INTERFACE = 0b10 << 7,
     STRICTFP = 0b10 << 8,
     BRIDGE = 0b10 << 9,
     VARARGS = 0b10 << 10,
     DECLSYNC = 0b10 << 11,
     ENUM = 0b10 << 12,
     SYNTH = 0b10 << 13,
     VOLATILE = 0b10 << 14,
     SYNC = 0b10 << 15,
     PRIVATE = 0b1 << 16,
     ANNOTATION = 0b10 << 17
}

export class ModifierFormat
{
     static sprintModifier(pModifier: Modifier): string
     {
          let dbg: string = "["

          if (pModifier & Modifier.PUBLIC) dbg += "public,";
          if (pModifier & Modifier.PROTECTED) dbg += "protected,";
          if (pModifier & Modifier.PRIVATE) dbg += "private,";
          if (pModifier & Modifier.TRANS) dbg += "transient,";
          if (pModifier & Modifier.STRICTFP) dbg += "strictfp,";
          if (pModifier & Modifier.DECLSYNC) dbg += "declsync,";
          if (pModifier & Modifier.CONSTRUCT) dbg += "construct,";
          if (pModifier & Modifier.ENUM) dbg += "enum,";
          if (pModifier & Modifier.INTERFACE) dbg += "interface,";
          if (pModifier & Modifier.ABSTRACT) dbg += "abstract,";
          if (pModifier & Modifier.STATIC) dbg += "static,";
          if (pModifier & Modifier.FINAL) dbg += "final,";
          if (pModifier & Modifier.SYNC) dbg += "synchronized,";
          if (pModifier & Modifier.SYNTH) dbg += "synthetic,";
          if (pModifier & Modifier.VOLATILE) dbg += "volatile,";
          if (pModifier & Modifier.ANNOTATION) dbg += "annotation,";

          return dbg + "]";
     }

     static toJsonObject(pModifier: Modifier):any{
          let o:any = {};

          if ((pModifier & Modifier.PUBLIC)>0) o.public = true;
          if ((pModifier & Modifier.PROTECTED)>0) o.protected = true;
          if ((pModifier & Modifier.PRIVATE)>0) o.private = true;
          if ((pModifier & Modifier.TRANS)>0) o.trans = true;
          if ((pModifier & Modifier.STRICTFP)>0) o.strictfp = true;
          if ((pModifier & Modifier.DECLSYNC)>0) o.declsync = true;
          if ((pModifier & Modifier.CONSTRUCT)>0) o.construct = true;
          if ((pModifier & Modifier.ENUM)>0) o.enum = true;
          if ((pModifier & Modifier.INTERFACE)>0) o.interface = true;
          if ((pModifier & Modifier.ABSTRACT)>0) o.abstract = true;
          if ((pModifier & Modifier.STATIC)>0) o.static = true;
          if ((pModifier & Modifier.FINAL)>0) o.final = true;
          if ((pModifier & Modifier.SYNC)>0) o.sync = true;
          if ((pModifier & Modifier.SYNTH)>0) o.synth = true;
          if ((pModifier & Modifier.ANNOTATION)>0) o.annotation = true;
          if ((pModifier & Modifier.VOLATILE)>0) o.volatile = true;

          return o;
     }
}
