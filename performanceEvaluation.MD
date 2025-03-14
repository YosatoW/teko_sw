# Performance Test

## pgbench -U postgres -d performance_tests
	performance_tests -i -s 100					Blerti:			Chien:			Wattana:
	done in:									310.96 s		230.67 s		
	drop tables:								0.01 s			0.00 s			
	create tables:								0.06 s			0.04 s			
	client-side generate:						252.61 s		161.83 s		
	vacuum:										21.76 s			29.24 s			
	primary keys:	 							36.52 s			39.56 s			

![PostgresSQL: Database initialization](images/Database%20initialization.png)

## performance_tests
												Blerti:			Chien:			Wattana:
	scaling factor:								100				100				100
	query mode:									simple			simple			simple
	number of clients:							1				1				1
	number of threads:							1				1				1
	maximum number of tries:					1				1				1
	number of transactions per client:			10				10				10
	number of transactions actually processed:	10/10			10/10			10/10
	number of failed transactions:				0 (0.000%)		0 (0.000%)		0 (0.000%)
	latency average:							6.323 ms		16.677 ms		
	initial connection time:					49.497 ms		50.769 ms		
	tps(without initial connection time):		158.147773		59.962463		

## performance_tests -c 50 -t 10000
												Blerti:			Chien:			Wattana:
	scaling factor:								100				100				100
	query mode:									simple			simple			simple
	number of clients:							50				50				1
	number of threads:							1				1				1
	maximum number of tries:					1				1				1
	number of transactions per client:			10000			10000			10000
	number of transactions actually processed:	500000/500000	500000/500000	500000/500000
	number of failed transactions:				0 (0.000%)		0 (0.000%)		0 (0.000%)
	latency average:							23.486 ms		17.352 ms		
	initial connection time:					2463.641 ms		837.051 ms		
	tps(without initial connection time):		2128.873132		2881.435300		


## load-test | CACHE_ACTIVE = "true"
	scenarios: (100.00%) 1 scenario, 50 max VUs, 10m30s max duration (incl. graceful stop):
	* default: 100000 iterations shared among 50 VUs (maxDuration: 10m0s, gracefulStop: 30s)

		✗ response code was 200
		↳  0% — ✓ 0 / ✗ 100000
	  
### Blerti:
	checks:						0.00%		0 out of 100000
	data_received:				31 MB		983 kB/s
	data_sent:					8.7 MB		272 kB/s
	http_req_blocked:			avg=30.49µs	min=0s		med=0s		max=41.55ms	p(90)=0s		p(95)=0s
	http_req_connecting:		avg=3.11µs	min=0s		med=0s		max=11.21ms	p(90)=0s		p(95)=0s
	http_req_duration:			avg=15.23ms	min=771.1µs	med=10.86ms	max=3.97s	p(90)=22.12ms	p(95)=27.65m
	http_req_failed:			100.00%		100000 out of 100000	
	http_req_receiving:			avg=175.9µs	min=0s		med=0s		max=31.16ms	p(90)=545.9µs	p(95)=640µs
	http_req_sending:			avg=47.55µs	min=0s		med=0s		max=22.29ms	p(90)=0s		p(95)=145µs
	http_req_tls_handshaking:	avg=0s		min=0s		med=0s		max=0s		p(90)=0s		p(95)=0s
	http_req_waiting:			avg=15.01ms	min=771.1µs	med=10.67ms	max=3.97s	p(90)=21.74ms	p(95)=27.12ms
	http_reqs:					100000		3130.099793/s
	iteration_duration:			avg=15.51ms	min=1.59ms	med=11.11ms	max=4.01s	p(90)=22.5ms	p(95)=28.08ms				
	iterations:					100000		3130.099793/s
	running:					(00m31.9s), 00/50 VUs, 100000 complete and 0 interrupted iterations
	default ✓					50 VUs  00m31.9s/10m0s  100000/100000 shared iters

### Chien:
	checks:						0.00%		0 out of 100000
	data_received:				31 MB		2.2 MB/s
	data_sent:					8.7 MB		616 kB/s
	http_req_blocked:			avg=10.86µs	min=0s		med=0s		max=13.84ms	p(90)=0s		p(95)=0s
	http_req_connecting:		avg=1.27µs	min=0s		med=0s		max=3.13ms	p(90)=0s		p(95)=0s
	http_req_duration:			avg=6.93ms	min=0s		med=3.19ms	max=7.16s	p(90)=4.94ms	p(95)=5.69ms
	http_req_failed:			100.00%		100000 out of 100000
	http_req_receiving:			avg=58.11µs	min=0s		med=0s		max=10.73ms	p(90)=0s		p(95)=531.29µs
	http_req_sending:			avg=16.17µs	min=0s		med=0s		max=5.53ms	p(90)=0s		p(95)=0s
	http_req_tls_handshaking:	avg=0s		min=0s		med=0s		max=0s		p(90)=0s		p(95)=0s
	http_req_waiting:			avg=6.86ms	min=0s		med=3.15ms	max=7.16s	p(90)=4.84ms	p(95)=5.55ms
	http_reqs:					100000		7080.730961/s
	iteration_duration:			avg=7.04ms	min=0s		med=3.24ms	max=7.17s	p(90)=5.06ms	p(95)=5.86ms
	iterations:					100000		7080.730961/s
	running:					(00m14.1s), 00/50 VUs, 100000 complete and 0 interrupted iterations
	default ✓					50 VUs  00m14.1s/10m0s  100000/100000 shared iters

### Wattana:
checks:						
data_received:				
data_sent:					
http_req_blocked:			
http_req_connecting:		
http_req_duration:			
http_req_failed:			100.00%		100000 out of 100000
http_req_receiving:			
http_req_sending:			
http_req_tls_handshaking:	
http_req_waiting:			
http_reqs:					
iteration_duration:			
iterations:					
running:					
default ✓					


## load-test | CACHE_ACTIVE = "false"

###Blerti:
	checks:						
	data_received:				
	data_sent:					
	http_req_blocked:			
	http_req_connecting:		
	http_req_duration:			
	http_req_failed:			100.00%		100000 out of 100000
	http_req_receiving:			
	http_req_sending:			
	http_req_tls_handshaking:	
	http_req_waiting:			
	http_reqs:					
	iteration_duration:			
	iterations:					
	running:					
	default ✓	

### Chien:
	checks:						0.00%		0 out of 100000
	data_received:				31 MB		1.0 MB/s
	data_sent:					8.7 MB		281 kB/s
	http_req_blocked:			avg=12.16µs	min=0s		med=0s		max=17.29ms	p(90)=0s		p(95)=0s
	http_req_connecting:		avg=2.16µs	min=0s		med=0s		max=5.41ms	p(90)=0s		p(95)=0s
	http_req_duration:			avg=9.18ms	min=525.5µs	med=4.32ms	max=16.55s	p(90)=8.37ms	p(95)=10ms
	http_req_failed:			100.00%		100000 out of 100000
	http_req_receiving:			avg=57.69µs	min=0s		med=0s		max=30.96ms	p(90)=0s		p(95)=527.8µs
	http_req_sending:			avg=14.06µs	min=0s		med=0s		max=13.27ms	p(90)=0s		p(95)=0s
	http_req_tls_handshaking:	avg=0s		min=0s		med=0s		max=0s		p(90)=0s		p(95)=0s
	http_req_waiting:			avg=9.1ms	min=525.5µs	med=4.29ms	max=16.55s	p(90)=8.27ms	p(95)=9.91ms
	http_reqs:					100000		3232.449678/s
	iteration_duration:			avg=9.27ms	min=525.5µs	med=4.42ms	max=16.55s	p(90)=8.48ms	p(95)=10.13ms
	iterations:					100000		3232.449678/s
	running:					(00m30.9s), 00/50 VUs, 100000 complete and 0 interrupted iterations 
	default ✓					50 VUs  00m30.9s/10m0s  100000/100000 shared iters

### Wattana:
	checks:						
	data_received:				
	data_sent:					
	http_req_blocked:			
	http_req_connecting:		
	http_req_duration:			
	http_req_failed:			100.00%		100000 out of 100000
	http_req_receiving:			
	http_req_sending:			
	http_req_tls_handshaking:	
	http_req_waiting:			
	http_reqs:					
	iteration_duration:			
	iterations:					
	running:					
	default ✓	


## stress-test | CACHE_ACTIVE = "true"
	scenarios: (100.00%) 1 scenario, 2000 max VUs, 4m30s max duration (incl. graceful stop):
	* breaking: Up to 2000 looping VUs for 4m0s over 8 stages (gracefulRampDown: 30s, gracefulStop: 30s)

### Blerti:
		✗ response code was 200
		↳  0% — ✓ 0 / ✗ 1167

	checks:						0.00%		0 out of 1167
	data_received:				366 kB		98 kB/s
	data_sent:					102 kB		27 kB/s
	http_req_blocked:			avg=5.38µs	min=0s		med=0s		max=1.06ms	p(90)=0s		p(95)=0s
	http_req_connecting:		avg=1.45µs	min=0s		med=0s		max=1.06ms	p(90)=0s		p(95)=0s
	http_req_duration:			avg=1.47ms	min=0s		med=1.24ms	max=12.97ms	p(90)=2.35ms	p(95)=2.84ms
	http_req_failed:			100.00%		1167 out of 1167
	http_req_receiving:			avg=63.9µs	min=0s		med=0s		max=1.63ms	p(90)=214.26µs	p(95)=512.44µs
	http_req_sending:			avg=9.64µs	min=0s		med=0s		max=1.53ms	p(90)=0s		p(95)=0s
	http_req_tls_handshaking:	avg=0s		min=0s		med=0s		max=0s		p(90)=0s		p(95)=0s
	http_req_waiting:			avg=1.4ms	min=0s		med=1.18ms	max=12.97ms	p(90)=2.22ms	p(95)=2.68ms
	http_reqs:					1167		313.325298/s
	iteration_duration:			avg=1.6ms	min=0s		med=1.35ms	max=13.33ms p(90)=2.54ms   p(95)=2.99ms
	iterations:					1167		313.325298/s
	vus:						3			min=1		max=3
	vus_max:					2000		min=2000	max=2000
	running:					(0m03.7s), 0000/2000 VUs, 1167 complete and 4 interrupted iterations
	default ✓					0004/2000 VUs  0m03.7s/4m00.0s
 


### Chien:
		✗ response code was 200
		↳  0% — ✓ 0 / ✗ 1845

	checks:						0.00%		0 out of 1845
	data_received:				580 kB  149 kB/s
	data_sent:					161 kB  41 kB/s
	http_req_blocked:			avg=4.91µs  min=0s med=0s     max=552.69µs p(90)=0s     p(95)=0s
	http_req_connecting:		avg=833ns   min=0s med=0s     max=531.4µs  p(90)=0s     p(95)=0s
	http_req_duration:			avg=1.1ms   min=0s med=1.06ms max=16.99ms  p(90)=1.62ms p(95)=2.18ms
	http_req_failed:			100.00%		1845 out of 1845
	http_req_receiving:			avg=50.32µs min=0s med=0s     max=1.24ms   p(90)=0s     p(95)=536.38µs
	http_req_sending:			avg=13.49µs min=0s med=0s     max=1ms      p(90)=0s     p(95)=0s
	http_req_tls_handshaking:	avg=0s      min=0s med=0s     max=0s       p(90)=0s     p(95)=0s
	http_req_waiting:			avg=1.04ms  min=0s med=1.05ms max=16.99ms  p(90)=1.61ms p(95)=2.17ms
	http_reqs:					1167		473.391401/s
	iteration_duration:			avg=1.2ms   min=0s med=1.07ms max=17.48ms  p(90)=1.65ms p(95)=2.21ms
	iterations:					1167		473.391401/s
	vus:						3       min=1            max=3
	vus_max:					2000    min=2000         max=2000
	running:					(0m03.9s), 0000/2000 VUs, 1845 complete and 4 interrupted iterations
	default ✓					0004/2000 VUs  0m03.9s/4m00.0s 			

### Wattana:
		✗ response code was 200
		↳  0% — ✓ 0 / ✗ 1845

	checks:						
	data_received:				
	data_sent:					
	http_req_blocked:			
	http_req_connecting:		
	http_req_duration:			
	http_req_failed:			100.00%		100000 out of 100000
	http_req_receiving:			
	http_req_sending:			
	http_req_tls_handshaking:	
	http_req_waiting:			
	http_reqs:					
	iteration_duration:			
	iterations:					
	vus:						3       min=1            max=3
	vus_max:					2000    min=2000         max=2000
	running:					
	default ✓					


## stress-test | CACHE_ACTIVE = "false"
	scenarios: (100.00%) 1 scenario, 2000 max VUs, 4m30s max duration (incl. graceful stop):
	* breaking: Up to 2000 looping VUs for 4m0s over 8 stages (gracefulRampDown: 30s, gracefulStop: 30s)

### Blerti:
		✗ response code was 200
		↳  0% — ✓ 0 / ✗ 1167

	checks:						
	data_received:				
	data_sent:					
	http_req_blocked:			
	http_req_connecting:		
	http_req_duration:			
	http_req_failed:			100.00%		100000 out of 100000
	http_req_receiving:			
	http_req_sending:			
	http_req_tls_handshaking:	
	http_req_waiting:			
	http_reqs:					
	iteration_duration:			
	iterations:					
	vus:						3       min=1            max=3
	vus_max:					2000    min=2000         max=2000
	running:					
	default ✓					

### Chien:
		✗ response code was 200
		↳  0% — ✓ 0 / ✗ 1845

	checks:						0.00%		0 out of 1845
	data_received:				580 kB  149 kB/s
	data_sent:					161 kB  41 kB/s
	http_req_blocked:			avg=4.91µs  min=0s med=0s     max=552.69µs p(90)=0s     p(95)=0s
	http_req_connecting:		avg=833ns   min=0s med=0s     max=531.4µs  p(90)=0s     p(95)=0s
	http_req_duration:			avg=1.1ms   min=0s med=1.06ms max=16.99ms  p(90)=1.62ms p(95)=2.18ms
	http_req_failed:			100.00%		1845 out of 1845
	http_req_receiving:			avg=50.32µs min=0s med=0s     max=1.24ms   p(90)=0s     p(95)=536.38µs
	http_req_sending:			avg=13.49µs min=0s med=0s     max=1ms      p(90)=0s     p(95)=0s
	http_req_tls_handshaking:	avg=0s      min=0s med=0s     max=0s       p(90)=0s     p(95)=0s
	http_req_waiting:			avg=1.04ms  min=0s med=1.05ms max=16.99ms  p(90)=1.61ms p(95)=2.17ms
	http_reqs:					1845		473.391401/s
	iteration_duration:			avg=1.2ms   min=0s med=1.07ms max=17.48ms  p(90)=1.65ms p(95)=2.21ms
	iterations:					1845		473.391401/s
	vus:						3       min=1            max=3
	vus_max:					2000    min=2000         max=2000
	running:					(0m03.9s), 0000/2000 VUs, 1845 complete and 4 interrupted iterations
	default ✓					0004/2000 VUs  0m03.9s/4m00.0s 

### Wattana:
		✗ response code was 200
		
	checks:						
	data_received:				
	data_sent:					
	http_req_blocked:			
	http_req_connecting:		
	http_req_duration:			
	http_req_failed:			100.00%		100000 out of 100000
	http_req_receiving:			
	http_req_sending:			
	http_req_tls_handshaking:	
	http_req_waiting:			
	http_reqs:					
	iteration_duration:			
	iterations:					
	vus:						3       min=1            max=3
	vus_max:					2000    min=2000         max=2000
	running:					
	default ✓					