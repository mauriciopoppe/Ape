/**
 * Created by mauricio on 1/14/15.
 */
function tryCatch(fn) {
  try {
    fn();
  } catch (e) {
    document.write(e.stack.replace(/\n/g, '<br />'));
  }
}

function assert(v) {
  if (!v) {
    throw Error();
  }
}

tryCatch(function () {
  assert(Ape);
  assert(Ape.core);
  assert(Ape.core.Quaternion);
  assert(Ape.core.Vector3);
  assert(Ape.core.Matrix3);
  assert(Ape.core.Matrix4);
});
