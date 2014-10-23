var util, array, search, random, operator, functools;

util = require( "util" );
array = require( "aureooms-js-array" );
search = require( "aureooms-js-search" );
random = require( "aureooms-js-random" );
operator = require( "aureooms-js-operator" );
functools = require( "aureooms-js-functools" );

var check = function(tmpl, ctor, m, n, diff) {
	var name = util.format("%s (new %s(%d, %d), %s)", tmpl[0], ctor.name, m, n, diff);
	console.log(name);
	test(name, function (assert) {

		// SETUP RANDOM
		var randint = random.randint;
		var sample = random.__sample__( randint );
		var shuffle = random.__shuffle__( sample );

		// SETUP UTILS
		var copy = array.copy;

		// SETUP SORT
		var partition = sort.partition;
		var quicksort = sort.__quicksort__( partition );
		var binarysearch = search.binarysearch;
		var merge = tmpl[1]( diff, binarysearch, copy );

		// SETUP ARRAYS, DEST
		var a, j;

		a = new ctor( m );

		for ( j = 0 ; j < m ; ++j ) {
			a[j] = randint( 0, m );
		}

		shuffle(a, 0, m);
		quicksort( diff, a, 0, m);

		var b = new ctor(n);
		for(j = 0; j < n; ++j) b[j] = randint(0, n);
		shuffle(b, 0, n);
		quicksort( diff, b, 0, n);

		var d = new ctor(n + m);

		// MERGE ARRAYS
		merge(a, 0, m, b, 0, n, d, 0);

		// REF
		var c = new ctor(n + m);
		copy(a, 0, m, c, 0);
		copy(b, 0, n, c, m);
		shuffle(c, 0, n + m);
		quicksort( diff, c, 0, n + m);

		deepEqual(d, c, 'check sorted');
		deepEqual(a.length, m, 'check length a');
		deepEqual(b.length, n, 'check length b');
		deepEqual(d.length, n + m, 'check length d');
	});
};

var DIFF = [
	sort.increasing,
	sort.decreasing
];

var TMPL = [
	['merge', function ( diff, binarysearch, copy ) {
		var index;

		index = functools.partial( binarysearch, [diff] );

		return sort.__merge__( index, copy );
	}],
	['binarymerge', function ( diff, binarysearch, copy ) {
		return sort.__binarymerge__( binarysearch, diff, copy );
	}],
	['tapemerge', function ( diff, binarysearch, copy ) {
		return functools.partial( sort.tapemerge, [diff] );
	}],
];

var N = [0, 1, 2, 10, 63, 64, 65]; // MUST BE IN INCREASING ORDER !!

var CTOR = [
	Array,
	Int8Array,
	Uint8Array,
	Int16Array,
	Uint16Array,
	Int32Array,
	Uint32Array,
	Float32Array,
	Float64Array
];

for(var t = 0; t < TMPL.length; ++t){
	for (var k = 0; k < CTOR.length; ++k) {
		for (var j = 0; j < N.length; ++j) {
			for (var l = 0; l <= j; ++l) {
				if(CTOR[k].BYTES_PER_ELEMENT && N[j] > Math.pow(2, CTOR[k].BYTES_PER_ELEMENT * 8))
					continue;

				for (var i = 0; i < DIFF.length; ++i) {
					check(TMPL[t], CTOR[k], N[j], N[l], DIFF[i]);
				}
			}
		}
	}
}

