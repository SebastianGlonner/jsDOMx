// The minjector library will be loaded in the HTML spec file.
// Minjector.config({
//   baseUrl: './'
// });

var jsDOMx;

beforeEach(function(done) {
  define(['../src/jsDOMx'], function(jsDOMxClass) {
    jsDOMx = new jsDOMxClass();
    done();
  });
});

describe('jsDOMx Specs', function() {

  // it('initialize', function() {
  //   expect(typeof jsDOMx === 'function').toBeTruthy();
  //   expect(typeof jsDOMx.render === 'function').toBeTruthy();
  // });

  it('render any node', function() {
    var res1 = jsDOMx.render('t1', function t1(_) {
      return _('div');
    });
    expect(res1.tagName).toBe('DIV');
    expect(res1.nodeType).toBe(1);

    var res2 = jsDOMx.render('t2', function t2(_) {
      return _('custom');
    });
    expect(res2.tagName).toBe('CUSTOM');
    expect(res2.nodeType).toBe(1);

  });

  it('append nested nodes', function() {
    var res = jsDOMx.render('t1', function t1(_) {
      return _('div',
                _('span'),
                _('h1'),
                _('custom')
             );
    });

    expect(res.tagName).toBe('DIV');
    expect(res.childNodes.length).toBe(3);
    expect(res.childNodes[2].tagName).toBe('CUSTOM');

  });

  it('has independend result vars', function() {
    var res1 = jsDOMx.render('t1', function t1(_) {
      return _('div',
                _('span')
             );
    });

    var res2 = jsDOMx.render('t2', function t2(_) {
      return _('div',
                _('p')
             );
    });

    expect(res1.childNodes[0].tagName).toBe('SPAN');
    expect(res2.childNodes[0].tagName).toBe('P');

  });

  it('can set text nodes', function() {
    var res = jsDOMx.render('t1', function t1(_) {
      return _('div',
                'any text',
                'more text'
             );
    });

    expect(res.tagName).toBe('DIV');
    expect(res.childNodes.length).toBe(2);
    expect(res.childNodes[0].nodeType).toBe(3);
    expect(res.childNodes[0].nodeValue).toBe('any text');
    expect(res.childNodes[1].nodeType).toBe(3);
    expect(res.childNodes[1].nodeValue).toBe('more text');

  });

  it('can set className with "." shortcut', function() {
    var res = jsDOMx.render('t1', function t1(_) {
      return _('div',
                '..myClass seccondclass'
             );
    });

    expect(res.className).toBe('myClass seccondclass');
  });

  it('objects will be interpreted as property mappings', function() {
    var res = jsDOMx.render('t1', function t1(_) {
      return _('div',
                {
                  'test': 'test',
                  'id': 'myId',
                  'className': 'myClass'
                }
             );
    });

    expect(res.id).toBe('myId');
    expect(res.test).toBe('test');
    expect(res.className).toBe('myClass');

    expect(res.getAttribute('id')).toBe('myId');
    expect(res.getAttribute('test')).toBe(null);
    expect(res.getAttribute('class')).toBe('myClass');
  });

  it('multiple property definitions does override previous', function() {
    var res = jsDOMx.render('t1', function t1(_) {
      return _('div',
                '..myClass',
                {
                  'className': 'myOtherClass'
                }
             );
    });

    expect(res.className).toBe('myOtherClass');
  });

  it('can register template functions', function() {
    jsDOMx.register('t1', function t1(_) {
      return _('div',
                _('span'),
                _('h1'),
                _('custom')
             );
    });

    var res = jsDOMx.render('t1');
    expect(res.tagName).toBe('DIV');
    expect(res.childNodes.length).toBe(3);
  });

  it('stores element references', function() {
    var refs = {};
    var res = jsDOMx.render('t1', function t1(_) {
      return _('div',
                '::myDiv'
             );
    }, null, refs);

    expect(typeof refs.myDiv).toBe('object');
    expect(refs.myDiv.nodeType).toBe(1);
  });

  it('throws for inappropriate refs argument', function() {
    var refs = {};
    var res = jsDOMx.render('t1', function t1(_) {
      return _('div',
                '::myDiv'
             );
    }, null, refs);

    expect(typeof refs.myDiv).toBe('object');
    expect(refs.myDiv.nodeType).toBe(1);
  });

  it('assigns as array if target is of type array', function() {
    var refs = {
      arrTarget: [10, 5, 'egal'] // refresh on starting rendering
    };
    jsDOMx.render('t1', function t1(_) {
      return _('div',
               _('div',
                   ':arrTarget'
               ),
               _('div',
                   ':arrTarget'
               )
      );
    }, null, refs);

    expect(refs.arrTarget.length).toBe(2);
  });

});
