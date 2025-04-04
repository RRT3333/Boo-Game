class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Game state
        this.score = 0;
        this.health = 3;
        this.timeLeft = 60;
        this.gameOver = false;
        this.gameStarted = false;

        // Player (Boo)
        this.player = {
            x: 100,
            y: 300,
            width: 50,
            height: 50,
            velocity: 0,
            gravity: 0.5,
            jumpForce: -10
        };

        // Game objects
        this.obstacles = [];
        this.items = [];
        this.backgroundX = 0;

        // Event listeners
        document.addEventListener('keydown', (e) => this.handleInput(e));
        document.addEventListener('click', () => this.handleInput());
        document.getElementById('restartButton').addEventListener('click', () => this.restart());

        // Start game loop
        this.lastTime = 0;
        this.init();
    }

    init() {
        // Reset game state
        this.score = 0;
        this.health = 3;
        this.timeLeft = 60;
        this.gameOver = false;
        this.gameStarted = true;
        this.obstacles = [];
        this.items = [];
        this.backgroundX = 0;
        this.player.y = 300;
        this.player.velocity = 0;

        // Start game loop
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));

        // Start timer
        this.timer = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                document.getElementById('timer').textContent = this.timeLeft;
                if (this.timeLeft === 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }

    handleInput(e) {
        if (e && e.code === 'Space' || !e) {
            if (!this.gameOver) {
                this.player.velocity = this.player.jumpForce;
            }
        }
    }

    spawnObstacle() {
        if (Math.random() < 0.02) {
            const type = Math.random() < 0.7 ? 'F' : 'obstacle';
            this.obstacles.push({
                x: this.canvas.width,
                y: Math.random() * (this.canvas.height - 100),
                width: 40,
                height: 40,
                type: type
            });
        }
    }

    spawnItem() {
        if (Math.random() < 0.01) {
            const type = Math.random() < 0.7 ? 'A+' : 'coin';
            this.items.push({
                x: this.canvas.width,
                y: Math.random() * (this.canvas.height - 100),
                width: 30,
                height: 30,
                type: type
            });
        }
    }

    updateGame() {
        // Update player
        this.player.velocity += this.player.gravity;
        this.player.y += this.player.velocity;

        // Keep player in bounds
        if (this.player.y > this.canvas.height - this.player.height) {
            this.player.y = this.canvas.height - this.player.height;
            this.player.velocity = 0;
        }
        if (this.player.y < 0) {
            this.player.y = 0;
            this.player.velocity = 0;
        }

        // Update background
        this.backgroundX -= 2;
        if (this.backgroundX <= -this.canvas.width) {
            this.backgroundX = 0;
        }

        // Update obstacles
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= 5;
            if (this.checkCollision(this.player, obstacle)) {
                this.health--;
                document.querySelectorAll('.heart')[this.health].style.opacity = '0.2';
                if (this.health === 1) {
                    document.querySelector('.hud').insertAdjacentHTML('beforeend', 
                        '<div class="warning">학사경고!</div>');
                }
                if (this.health <= 0) {
                    this.endGame();
                }
                return false;
            }
            return obstacle.x > -obstacle.width;
        });

        // Update items
        this.items = this.items.filter(item => {
            item.x -= 3;
            if (this.checkCollision(this.player, item)) {
                if (item.type === 'A+') {
                    this.score += 100;
                } else {
                    this.score += 50;
                }
                document.getElementById('score').textContent = this.score;
                return false;
            }
            return item.x > -item.width;
        });

        // Spawn new objects
        this.spawnObstacle();
        this.spawnItem();
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    drawGame() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw player (Boo)
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = obstacle.type === 'F' ? '#FF0000' : '#000000';
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '20px Arial';
            this.ctx.fillText(obstacle.type, obstacle.x + 15, obstacle.y + 25);
        });

        // Draw items
        this.items.forEach(item => {
            this.ctx.fillStyle = item.type === 'A+' ? '#00FF00' : '#FFD700';
            this.ctx.fillRect(item.x, item.y, item.width, item.height);
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(item.type, item.x + 5, item.y + 20);
        });
    }

    gameLoop(timestamp) {
        if (this.lastTime === 0) {
            this.lastTime = timestamp;
        }
        const deltaTime = timestamp - this.lastTime;

        if (!this.gameOver) {
            this.updateGame();
            this.drawGame();
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }

        this.lastTime = timestamp;
    }

    endGame() {
        this.gameOver = true;
        clearInterval(this.timer);
        document.getElementById('finalScore').textContent = this.score;
        document.querySelector('.game-over').classList.remove('hidden');

        // Save score
        fetch('/game/save-score/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': this.getCookie('csrftoken')
            },
            body: `score=${this.score}`
        });
    }

    restart() {
        document.querySelector('.game-over').classList.add('hidden');
        document.querySelectorAll('.heart').forEach(heart => heart.style.opacity = '1');
        const warning = document.querySelector('.warning');
        if (warning) {
            warning.remove();
        }
        this.init();
    }

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    new Game();
}); 