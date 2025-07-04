// -- App specific --
import {Merlin} from "../src/search/Merlin.js";
import {K8ResourceType, K8sHelper} from "../src/core/k8s/K8sHelper.js";
import Util from "../src/Utils.js";
import {InterceptorType,  TestExecHelperClass} from "../src/tests/TestExecHelper.js";
import {after} from "mocha";

describe('K8sHelper', function() {

    describe('scale', async function() {

        if(!TestExecHelperClass.getInstance().hasInterceptor( InterceptorType.EXEC_ASYNC, "ls")){
            TestExecHelperClass.getInstance().intercept(
                InterceptorType.EXEC_ASYNC, {
                    name: "ls",
                    testRE: /kubectl/,
                    ret: `kubectl mock`
                });
        }

        console.log('scale',TestExecHelperClass.getInstance());

        it('statefulset', async function () {

            process.env.DEXCALIBUR_TEST = "1";
            //console.log(await Util.execAsync("ls"));
            K8sHelper.scale(K8ResourceType.STATEFULSET, 'testset', 2, "default")
            //expect(db.encoding).to.be.equals('ascii');
        });
    });

});