




import * as _path_ from 'path';
import {expect} from "chai";
import AndroidInputProfile from "../src/android/profiles/AndroidInputProfile.js";


const WELL_FORMED =
`I: Bus=0006 Vendor=0000 Product=0000 Version=0000
N: Name="virtio_input_multi_touch_1"
P: Phys=virtio8/input0
S: Sysfs=/devices/platform/3f000000.pcie/pci0000:00/0000:00:02.0/virtio8/input/input0
U: Uniq=
H: Handlers=event0 
B: PROP=0
B: EV=2b
B: KEY=802 0 0 0 0 0
B: ABS=6f3800000000007
B: SW=1

I: Bus=0006 Vendor=0000 Product=0000 Version=0000
N: Name="virtio_input_multi_touch_2"
P: Phys=virtio9/input0
S: Sysfs=/devices/platform/3f000000.pcie/pci0000:00/0000:00:03.0/virtio9/input/input1
U: Uniq=
H: Handlers=event1 
B: PROP=0
B: EV=2b
B: KEY=802 0 0 0 0 0
B: ABS=6f3800000000007
B: SW=1

I: Bus=0006 Vendor=0000 Product=0000 Version=0000
N: Name="virtio_input_multi_touch_3"
P: Phys=virtio10/input0
S: Sysfs=/devices/platform/3f000000.pcie/pci0000:00/0000:00:04.0/virtio10/input/input2
U: Uniq=
H: Handlers=event2 
B: PROP=0
B: EV=2b
B: KEY=802 0 0 0 0 0
B: ABS=6f3800000000007
B: SW=1

I: Bus=0006 Vendor=0000 Product=0000 Version=0000
N: Name="virtio_input_multi_touch_4"
P: Phys=virtio11/input0
S: Sysfs=/devices/platform/3f000000.pcie/pci0000:00/0000:00:05.0/virtio11/input/input3
U: Uniq=
H: Handlers=event3 
B: PROP=0
B: EV=2b
B: KEY=802 0 0 0 0 0
B: ABS=6f3800000000007
B: SW=1

I: Bus=0006 Vendor=0000 Product=0000 Version=0000
N: Name="virtio_input_multi_touch_5"
P: Phys=virtio12/input0
S: Sysfs=/devices/platform/3f000000.pcie/pci0000:00/0000:00:06.0/virtio12/input/input4
U: Uniq=
H: Handlers=event4 
B: PROP=0
B: EV=2b
B: KEY=802 0 0 0 0 0
B: ABS=6f3800000000007
B: SW=1

I: Bus=0006 Vendor=0000 Product=0000 Version=0000
N: Name="virtio_input_multi_touch_6"
P: Phys=virtio13/input0
S: Sysfs=/devices/platform/3f000000.pcie/pci0000:00/0000:00:07.0/virtio13/input/input5
U: Uniq=
H: Handlers=event5 
B: PROP=0
B: EV=2b
B: KEY=802 0 0 0 0 0
B: ABS=6f3800000000007
B: SW=1

I: Bus=0006 Vendor=0000 Product=0000 Version=0000
N: Name="virtio_input_multi_touch_7"
P: Phys=virtio14/input0
S: Sysfs=/devices/platform/3f000000.pcie/pci0000:00/0000:00:08.0/virtio14/input/input6
U: Uniq=
H: Handlers=event6 
B: PROP=0
B: EV=2b
B: KEY=802 0 0 0 0 0
B: ABS=6f3800000000007
B: SW=1

I: Bus=0006 Vendor=0000 Product=0000 Version=0000
N: Name="virtio_input_multi_touch_8"
P: Phys=virtio15/input0
S: Sysfs=/devices/platform/3f000000.pcie/pci0000:00/0000:00:09.0/virtio15/input/input7
U: Uniq=
H: Handlers=event7 
B: PROP=0
B: EV=2b
B: KEY=802 0 0 0 0 0
B: ABS=6f3800000000007
B: SW=1

I: Bus=0006 Vendor=0000 Product=0000 Version=0000
N: Name="virtio_input_multi_touch_9"
P: Phys=virtio16/input0
S: Sysfs=/devices/platform/3f000000.pcie/pci0000:00/0000:00:0a.0/virtio16/input/input8
U: Uniq=
H: Handlers=event8 
B: PROP=0
B: EV=2b
B: KEY=802 0 0 0 0 0
B: ABS=6f3800000000007
B: SW=1

I: Bus=0006 Vendor=0000 Product=0000 Version=0000
N: Name="virtio_input_multi_touch_10"
P: Phys=virtio17/input0
S: Sysfs=/devices/platform/3f000000.pcie/pci0000:00/0000:00:0c.0/virtio17/input/input9
U: Uniq=
H: Handlers=event9 
B: PROP=0
B: EV=2b
B: KEY=802 0 0 0 0 0
B: ABS=6f3800000000007
B: SW=1

I: Bus=0006 Vendor=0000 Product=0000 Version=0000
N: Name="virtio_input_multi_touch_11"
P: Phys=virtio18/input0
S: Sysfs=/devices/platform/3f000000.pcie/pci0000:00/0000:00:0d.0/virtio18/input/input10
U: Uniq=
H: Handlers=event10 
B: PROP=0
B: EV=2b
B: KEY=802 0 0 0 0 0
B: ABS=6f3800000000007
B: SW=1

I: Bus=0006 Vendor=0627 Product=0001 Version=0001
N: Name="qwerty2"
P: Phys=virtio19/input0
S: Sysfs=/devices/platform/3f000000.pcie/pci0000:00/0000:00:0e.0/virtio19/input/input11
U: Uniq=
H: Handlers=leds event11 
B: PROP=0
B: EV=120003
B: KEY=3f0 0 30 8000 0 0 1e402000000 3078f800dfff f2beffff1bcfffff fffffffffffffffe
B: LED=7`;


const WELLFORMED_GETEVENT =
`add device 1: /dev/input/event11
  name:     "qwerty2"
  events:
    KEY (0001): 0001  0002  0003  0004  0005  0006  0007  0008 
                0009  000a  000b  000c  000d  000e  000f  0010 
                0011  0012  0013  0014  0015  0016  0017  0018 
                0019  001a  001b  001c  001d  001e  001f  0020 
                0021  0022  0023  0024  0025  0026  0027  0028 
                0029  002a  002b  002c  002d  002e  002f  0030 
                0031  0032  0033  0034  0035  0036  0037  0038 
                0039  003a  003b  003c  003d  003e  003f  0040 
                0041  0042  0043  0044  0045  0046  0047  0048 
                0049  004a  004b  004c  004d  004e  004f  0050 
                0051  0052  0053  0056  0057  0058  0059  005b 
                005c  0060  0061  0062  0063  0064  0065  0066 
                0067  0068  0069  006a  006b  006c  006d  006e 
                006f  0071  0072  0073  0074  0075  0077  0079 
                007c  007d  007e  007f  0080  0081  0082  0083 
                0084  0085  0086  0087  0088  0089  008a  008b 
                008c  008e  008f  009b  009c  009d  009e  009f 
                00a3  00a4  00a5  00a6  00ac  00ad  00d9  00e2 
                00e5  00e6  00e7  00e8  018f  01c4  01c5  0244 
                0245  0246  0247  0248  0249 
    LED (0011): 0000  0001  0002 
  input props:
    <none>
add device 2: /dev/input/event9
  name:     "virtio_input_multi_touch_10"
  events:
    KEY (0001): 0141  014b 
    ABS (0003): 0000  : value 0, min 0, max 32767, fuzz 0, flat 0, resolution 0
                0001  : value 0, min 0, max 32767, fuzz 0, flat 0, resolution 0
                0002  : value 0, min 0, max 1, fuzz 0, flat 0, resolution 0
                002f  : value 0, min 0, max 10, fuzz 0, flat 0, resolution 0
                0030  : value 0, min 0, max 2147483647, fuzz 0, flat 0, resolution 0
                0031  : value 0, min 0, max 2147483647, fuzz 0, flat 0, resolution 0
                0034  : value 0, min 0, max 90, fuzz 0, flat 0, resolution 0
                0035  : value 0, min 0, max 32767, fuzz 0, flat 0, resolution 0
                0036  : value 0, min 0, max 32767, fuzz 0, flat 0, resolution 0
                0037  : value 0, min 0, max 15, fuzz 0, flat 0, resolution 0
                0039  : value 0, min 0, max 65535, fuzz 0, flat 0, resolution 0
                003a  : value 0, min 0, max 1024, fuzz 0, flat 0, resolution 0
    SW  (0005): 0000 
  input props:
    <none>
`;

describe('AndroidInputProfiler', function() {

    before(function () {

    })

    describe('parseBusInfo()', async function () {

        let buses = AndroidInputProfile.parseBusInfo(Buffer.from(WELL_FORMED));

        console.log(buses)

        it('parsing of strings.xml file from a valid Android APK file ', function () {
            expect(buses.length).to.be.equals(11);
        });
    });
});